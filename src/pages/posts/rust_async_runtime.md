---
layout: ../../layouts/PostLayout.astro
title: "Writing an Async Runtime in Rust"
subtitle: "Learning async Rust in depth by building a simple runtime from scratch"
date: "April 23, 2023"
---

If you've used Rust to build anything for the web (or anything that needs to talk to something else
over a network), more than likely you've encountered `async`/`await` syntax. You've probably had to
install an async runtime (more than likely `tokio`).

Most of the time, things like `tokio`do a pretty good job of staying out of your way; you slap a
`[tokio::main]` on top of your `main`function, and use things like `tokio::net::TcpListener` instead
of `std::net::TcpListener`, and magically your server can now handle thousands of concurrent TCP
connections while using only a couple of threads.

But what's really going on? The ["async in depth" section](https://tokio.rs/tokio/tutorial/async) of
the `tokio`documentation does a good job of explaining the different async traits & helper structs
provided by the Rust standard library, and how they are implemented by `tokio`. You'll come away
with some concepts like what an executor, a task, a waker, and a future is. But in the example,
you're still just spawning a thread to sleep for a certain number of seconds, and then using a magic
`ArcWaker` trait from another crate to schedule your tasks.

I've gone through this documentation a few times over the years, and I've always been a happy user
of async Rust. I've read plenty of articles, used plenty of libraries, and written lots of async
code. But in the interest understanding the design decisions and tradeoffs involved in runtimes like
`tokio` (e.g. `Send + 'static` futures sure are annoying -- what would a purely single-threaded
runtime be like?), I built
[my own async runtime for Rust](https://github.com/michaelhelvey/lilfuture), with no dependencies
(well, two technically; I used `rustix` to bind to the POSIX APIs I needed, and of course the
standard Rust library). It's small, scrappy, probably subtly incorrect in a few important ways, and
utterly useless for anything more than educational purposes, but it taught me a lot about async
runtimes in Rust.

In the following post, I plan to walk through what the runtime does and how all the pieces fit
together, and at the end, provide some reflections on the exercise as a whole.

:::note
the following article is going to be a pretty in-depth walkthrough of writing an async
runtime, with long chunks of code and explanations. If you're looking for more of a TL;DR on async
Rust in general, I highly recommend the Tokio documentation referenced above.
:::

## What is Async I/O?

(If you are already familiar with the premise of non-blocking I/O, green threads, etc, feel free to
skip to the next section, as this bit has nothing to do with Rust.)

Before I jump into talking through the library, I wanted to briefly address what the goal of all
this is. Async, or non-blocking, I/O certainly isn't unique to Rust, and most languages have some
mechanism for it (and even in ones that don't, like C, there's nothing preventing you from using the
async APIs that your OS provides, albeit with a lot more work to do on your end).

Normally, when you make a syscall like `read`, the operating system will pause the current thread
that made the call, save the stack & other context, swap in the context from another thread
(possibly from another process altogether), and execute something else while it's waiting for the
bytes to be available that you asked for. Then when the bytes do become available, it'll schedule
your thread to be executed again next time the OS gets around to it. This is how multi-tasking
operating systems work.

However, it's a bit wasteful (at least from your thread's perspective), to have to block until a
read or write completes. After all, there's lots of other stuff you could be doing (like reading
from _another_ socket). While you're waiting to read from client 1, you could be processing client 2's
request.

Non-blocking I/O refers to the ability to make a syscall like `read` or `write` without it blocking
the current thread, so that you can do other work while you wait. Async APIs provided by different
operating systems provide a way to make an I/O request, but tell the operating system that you
intend to come back and ask for the result later, enabling you continue doing other work on the same
thread.

Let's quickly look at what the API for that looks like on macOS. MacOS is based on BSD which uses
the `kqueue` API for registering and polling for events. It exposes an API that works like this
(don't worry, we'll get to Rust soon):

```c
// ...code to set up socketfd, create a TCP connection, etc

// (error handling etc elided in the following example)

// set O_NONBLOCK on the socket so that calls to read() do not block
int flags = fcntl(socketfd, F_GETFL, 0);
fcntl(socketfd, F_SETFL, flags | O_NONBLOCK);

// create a new queue for events:
int kqueuefd = kqueue();

// register a "readable" event with the queue:
struct kevent event;
EV_SET(&event, socketfd, EVFILT_READ, EV_ADD | EV_ONESHOT | EV_RECEIPT, 0, 0, (void *)1);
kevent(kqueuefd, &changelist, 0, NULL, 0, NULL);

// ... do other work on the thread

// now when we're done with everything we _can_ do, we can go back to to kqueue and say "block
// until one of the events we registered earlier comes available"
kevent(kqueuefd, NULL, 0, &event, 1, NULL);

// eventlist will now have all the events that are ready in it. in this case because we just
// have one, so we don't bother checking
char buf[1024];
read(socketfd, &buf, 1024);
printf("Received from socket: \n%s\n", (char *)&buf);
```

Other operating systems expose pretty similar APIs, like `epoll` on Linux, or IOCP on Windows. All
follow the main pattern of providing a mechanism to inform the OS about events we care about without
actually waiting for them, and then providing a way to come back later and check on the events we
previously asked the OS to keep track of for us.

:::note
This all seems like a lot of work to do what the operating system apparently does for us out
of the box, you might ask. Can't we just spawn lots of threads and let the OS handle switching
between them when they block?

Well, frankly, yes, sort of. Lots of web servers work that way. Apache works that way. Most Java
applications on the planet work that way, at least up until relatively recently. Etc. You can
absolutely just spawn lots of threads and handle a request per-thread. Operating system schedulers
can handle potentially thousands of threads on a powerful machine even on a relatively tiny number
of physical CPU cores.

However, operating system threads are _really_ expensive compared to non-blocking I/O in userspace.
When you block a thread and yield control back to the OS, it has to save the current execution
context (CPU registers, program counter, stack pointer, the stack itself, etc) into memory. It may
need to update memory mappings or page tables to keep the address space of your thread separated
from the address space of the process it's about to schedule in its place. And of course there's the
scheduler overhead itself: it has to pick the next task to run. Finally, it has to do all that again
when it switches _back_ to your thread. In comparison, userspace coroutines are just normal
userspace functions, with no extra overhead.

So just like OS threads let you spread work from many threads across only a few CPU cores,
non-blocking I/O lets you spread work from many logical userspace "tasks" across only a few CPU
threads.
:::

## Async I/O In Rust

With that out of the way, let's look at what doing async I/O in Rust looks like. Most articles about
this start at the top, with `async`/`await` syntax, and using an executor. Instead, I want to start
at the bottom, and build things up from first principles, so to speak.

### Kqueue in Rust

We already saw a snippet of how to use `kqueue` in C, now let's use it from Rust. `rustix`is a 3rd
party crate that offers bindings to \*nix APIs that we'll use for this (calling into C ourselves
isn't particularly hard, but I wanted to focus on using the API rather than the details of how to
call C over FFI in Rust, which is a bit out of scope).

First of all, we need a way to register events and then come back later and ask for any that have
come available since we last checked. To do this, we'll create a struct called `Poller` that wraps a
`kqueue` file descriptor.

```rust
impl Poller {
    /// Creates a new poller with an underlying kqueue
    pub(crate) fn new() -> io::Result<Self> {
        let queue = kqueue::kqueue()?;

        Ok(Self { queue })
    }
// ... to be continued
```

While there are lots of events types that kqueue supports, for our example, we'll focus on socket
events and timers.

First, we'll create a struct to represent the kinds of socket events we care about, called
`SocketEvent`.

```rust
#[derive(Debug)]
pub(crate) struct SocketEvent {
    pub(crate) key: usize,
    pub(crate) readable: bool,
    pub(crate) writable: bool,
}
```

This is a logical representation of an underlying `kqueue::event` struct from the C library (what we
created with the `EV_SET` macro in the first example). Now we'll write a way to register such an
event with our `Poller`:

```rust
// pub struct Poller {
	/// Registers interest in events descripted by `Event` in the given file descriptor referrred to
    /// by `file`.
    pub(crate) fn register_socket(
        &self,
        socket: BorrowedFd<'_>,
        event: SocketEvent,
    ) -> io::Result<()> {
        let read_flags = if event.readable {
            kqueue::EventFlags::ADD
        } else {
            kqueue::EventFlags::DELETE
        };

        let write_flags = if event.writable {
            kqueue::EventFlags::ADD
        } else {
            kqueue::EventFlags::DELETE
        };

        // Because all of our events are ONESHOT we don't need to provide a de-registration API.
        let common_file_flags = kqueue::EventFlags::RECEIPT | kqueue::EventFlags::ONESHOT;

        let changelist = [
            kqueue::Event::new(
                kqueue::EventFilter::Read(socket.as_raw_fd()),
                common_file_flags | read_flags,
                event.key as _,
            ),
            kqueue::Event::new(
                kqueue::EventFilter::Write(socket.as_raw_fd()),
                common_file_flags | write_flags,
                event.key as _,
            ),
        ];

        // Create our buffer on the stack that kqueue will use to write responses into for each
        // event that we pass in our changelist
        unsafe {
            register_events(&self.queue, &changelist, None)?;
        };

        Ok(())
    }
// ... to be continued
```

Here, we calculate the flags we want to set based on the `readable`and `writable` properties in the
`SocketEvent`, and use that to build up a changelist to pass to the `kevent` function. The consumer
who is registering the event can use the `key`to identify the event when it comes available when we
poll it later. Finally, we call `register_events`, which is just a thin wrapper around the `kevent`
function that allows for passing our changelist on the stack instead of on the heap, as an
optimization (this is only required because `rustix` requires us to take an `&mut Vec<T>` for the
changelist, which I don't want to allocate, so I do some unsafe debauchery to create what
`rustix`thinks is a Vec, but on the stack. You can check out the full code [on Github](https://github.com/michaelhelvey/lilfuture).

The code for registering a timer is close to identical, except that of course we register the
`Timer` filter instead of a `Read` or `Write` filter.

With that out of the way, the last thing we need is a way to go back and check on the events we've
registered in the past. We can do that with a simple call to `kevent`:

```rust
/// Blocks until at least one of the previously registered events becomes available.  Places
/// found events into the `events` struct which can then be iterated over using `events.iter()`.
pub(crate) fn wait(&self, events: &mut Events) -> io::Result<()> {
    unsafe { kqueue::kevent(&self.queue, &[], &mut events.eventlist, None)? };

    Ok(())
}
```

Here `&mut Events` is a reference to a struct in our poller module called `Events` that simply
provides an interface for mapping any `kqueue::event` structs we get back into our more simple and
friendly `SocketEvent`or `TimerEvent`structs, so that the consumers of our `Poller`don't have to
parse flags and filters themselves.

### Event Loops & State Machines

With all that out of the way, we're most of the way to an event loop. Let's look at an example of
our `Poller`struct in action:

```rust
// Create a poller
let poller = Poller::new().unwrap();

// Create a new blocking Tcp listener on a un-allocated port:
let addr = "127.0.0.1:3456";
let listener = TcpListener::bind(addr).unwrap();
listener.set_nonblocking(true).unwrap();

// Register that we want to know when that listener is readable:
poller
    .register_socket(listener.as_fd(), SocketEvent::readable(1234))
    .unwrap();

let mut events = Events::new();

// connect to the listener from another thread to trigger an event:
std::thread::scope(|s| {
    s.spawn(|| {
        let _ = TcpStream::connect(addr).unwrap();
    });
});

// ######### This is where we could do any other work if we had any ###########

// Block until we get an event:
poller.wait(&mut events).unwrap();

// Assert that the event that we found was the event that we registered for earlier.  This
// should work because we only registered a single event.
let found_events: Vec<Event> = events.iter().collect();
assert_eq!(found_events.len(), 1);

let Some(Event::Socket(event)) = found_events.first() else {
    panic!(
        "Expected to receive Some(SocketEvent) as first event, but got {:?}",
        found_events.first()
    );
};

assert_eq!(event.key, 1234);
assert!(event.readable);
assert!(!event.writable);
```

We're doing non-blocking I/O in Rust! But it's not very impressive yet, because we don't really have
a good way to coordinate what to do before we wait for events. There's just a comment in the code
saying that we _could_ do more work at that point, but how do we actually figure out what to do?

We need a way to model work that is accomplished incrementally, and we need a way to loop over all
the work that we have in a queue before we wait for more events.

#### Digression: Building An Event Loop in JavaScript

At the instruction of the often mis-attributed adage "you don't really understand something unless
you can explain it simply," I think it's helpful to write out the basic logic of what we're building
in a higher level language. We can build out a complete non-blocking event loop in JavaScript in
about 100 lines. (Not _using_ JavaScript's built-in event loop, I mean writing our own event loop.)
This example will contain all the actual components of the system we're about to build in Rust, so
it will be helpful to keep in mind after we get deep into Rust implementation details later.

Let's start by getting some housekeeping out of the way. For our emulator, we're going to want to
create a mock file system. We'll do that with an array and a function that either returns the
contents of a file, or a "would_block" error, just like the real OS `read` syscall would for a
non-blocking socket.

```js
const files = {
	1: { fd: 1, contents: "contents of file 1" },
	2: { fd: 2, contents: "contents of file 2" },
}

function readFile(fd) {
	const isReady = Math.random() >= 0.5

	if (isReady) {
		return files[fd].contents
	}

	return "would_block"
}
```

Now because this is JavaScript, we need a way to force the main thread to block, and because this is
Node.js I'm using, I have to cheat and write a spin loop. Obviously this is terrible JavaScript, but
we're trying to emulate something else here.

```js
function blockFor(seconds) {
	const now = new Date().getTime()
	const deadline = seconds * 1000 + now
	while (new Date().getTime() < deadline) {}
}
```

With that out of the way, we can get down to the business of writing an event system. We'll have two
top-level arrays, one to hold events that we care about, and the other to hold onto tasks (we'll get
to the definition of a task in a second, but it's just an object that we can call to make progress
on some piece of work).

Then we'll have two functions, just like our Rust `Poller`, one for registering interest in an
event, and the other for waiting until an event is ready. When we wait for events, however, we'll do
one extra thing: we'll store a reference to the task that was interested in the event, and we'll
"schedule" it by pushing into the `tasks` array:

```js
const events = []
const tasks = []

function registerInterest(event, task) {
	events.push({ event, task })
}

function waitForEvents() {
	if (events.length === 0) {
		return
	}
	console.log("waiting for events for %s seconds", 1)
	blockFor(1)

	let entry = events.pop()
	while (entry) {
		tasks.push(entry.task)
		entry = events.pop()
	}
}
```

Now that we have a mini-filesystem and a way to schedule work and register interest in events, let's
write a little class called `Task` that has a function called `poll()` that we can use to say "try
to make a little progress on whatever it is you're supposed to be doing." We'll also need to keep
track of the task's state, so that we know what to make progress _on_. This is a very specialized
kind of task that can only read from files, and then print out their contents, but we'll save
writing a more generalized task abstraction for when we build this in Rust, later. (To jump ahead a
little, this class represents a union of a `Task` and a `Future` from Rust).

```js
class Task {
	constructor(fd) {
		this.fileDescriptor = fd
		this.state = { type: "init" }
	}

	poll() {
		// Loop until we return either ready or pending:
		for (;;) {
			switch (this.state.type) {
				case "init": {
					console.log({ task: this.fileDescriptor, state: "init" })

					// Ask to be notified when something has happened to our file:
					registerInterest({ type: "ReadFile", fileDescriptor: this.fileDescriptor }, this)
					this.state = { type: "waiting_for_file", fileDescriptor: this.fileDescriptor }

					return "pending"
				}
				case "waiting_for_file": {
					console.log({ task: this.fileDescriptor, state: "waiting_for_file" })

					// Check in on the actual state of our file:
					const fileContents = readFile(this.state.fileDescriptor)

					// If it would still block, we just say "too bad, wake me up next time", and go back to
					// sleep by retunring "pending"
					if (fileContents === "would_block") {
						registerInterest({ type: "ReadFile", fileDescriptor: this.fileDescriptor }, this)
						return "pending"
					}

					// Otherwise, we successfully got some bytes out of our file, so we're done
					this.state = { type: "done", fileContents }
					break
				}
				case "done": {
					// Here, we don't register interest in anything, so the event system will never schedule
					// us again after this.
					console.log({ task: this.fileDescriptor, state: "done" })
					console.log(
						"Task %d read file contents: %s",
						this.fileDescriptor,
						this.state.fileContents,
					)
					return "ready"
				}
			}
		}
	}
}
```

Now we have 1) an event system that schedules tasks by pushing them onto a queue whenever an event a
task is interested in is ready, and 2) a task that keeps track of its internal state and exposes a
`poll()` method we can use to make some progress on whatever work it represents.

Now all we need to do is poll all our tasks in a loop, and then when we're out of tasks, block until
the event system has returned at least one event (which means that it's scheduled more work).

```js
// Push a couple of tasks up front so our event loop has something to do:
tasks.push(new Task(1))
tasks.push(new Task(2))

for (;;) {
	console.log("event loop tick")
	let currentTask = tasks.shift()
	while (currentTask) {
		currentTask.poll()
		currentTask = tasks.shift()
	}

	// We're all out of tasks, so at this point it's safe to block and yield control back to the OS.
	// There is literally nothing else for this thread to do at this moment in time.
	waitForEvents()

	// If we waited for events and nothing got scheduled, then the whole program has nothing
	// to do, so we should just exit the whole program.
	if (tasks.length === 0) {
		break
	}
}
```

Because `readFile` is somewhat random, you won't get the exact same output every time, but running
on my machine just now, here's what we get:

```
❯ time node event_loop.js
event loop tick
{ task: 1, state: 'init' }
{ task: 2, state: 'init' }
waiting for events for 1 seconds
event loop tick
{ task: 2, state: 'waiting_for_file' }
{ task: 2, state: 'done' }
Task 2 read file contents: contents of file 2
{ task: 1, state: 'waiting_for_file' }
waiting for events for 1 seconds
event loop tick
{ task: 1, state: 'waiting_for_file' }
waiting for events for 1 seconds
event loop tick
{ task: 1, state: 'waiting_for_file' }
{ task: 1, state: 'done' }
Task 1 read file contents: contents of file 1
node event_loop.js  2.96s user 0.02s system 97% cpu 3.043 total
```

On the first tick of the event loop, both tasks initialized and registered interest in their
respective file descriptors. Then the runtime waited for 1 second, after which the event system
scheduled both tasks to be polled again. Task #2's next file read did not block, so it immediately
printed out the file contents and exited. Task #1 was less lucky, and had to be polled 2 more times
before it got the output it wanted and exited.

(Why does `readFile`sometimes return `would_block` even if the event system said it wouldn't?
Unfortunately, this is also to emulate the real world: what `kqueue` thinks is ready to read isn't
necessarily _actually_ read to read, so tasks need to be able to handle spurious wake-ups.
Additionally, in the real world, you're not always going to have one-shot reads or writes like this,
you would probably want to read out N bytes of the file into a buffer, process the buffer, and then
loop again to read the next N bytes out of the file, before finally returning only when a `read`
returns 0 bytes. The randomness of `readFile` in our emulator represents both of these cases.)

Examining the timings of this system, we can see the following:

1. The read of file descriptor 2 took 1 second.
2. The read of file descriptor 1 took 3 seconds.

If this were processed linearly, we would have a total system processing time of 4 seconds, but
as the `time` invocation above shows, the actual processing time was 3 seconds, just as if both
processes took place in parallel. Concurrency!

You can get the complete code above
[here](https://gist.github.com/michaelhelvey/68a8de59c2fa5e702d36d0759b620419).

If all that made sense, then you understand pretty much everything you need to know about
non-blocking I/O to understand what we're building in Rust. Different languages have different
syntax that compiles down to something like our `Task` class, and some languages run the event loop
behind the scenes (JavaScript) while others let you run it on your own (Rust), but it all works
basically like the above.

All we need to do now is implement the logic above in Rust and we'll have an async runtime.

:::note
Side note: you might be wondering, "but what about returning values from tasks?" In Rust we
can do things like `let some_value = some_future().await;` . That's what the "pending" and "ready"
return values from our poll function are for, we're just not doing anything with them in the
example.

In the real world a task like this might _contain_ some other state machine that it can poll in
turn. So instead of asking the OS "is this file ready to read", it might ask its child state machine
"are _you_ ready to read." So in reality most tasks in an event loop are the top level of a Russian
nesting doll of state machines. We'll see that in more detail when we build it in Rust.
:::

### Building an event loop in Rust

There's a number of different moving pieces in the above that we could start with when building our
async runtime. The main 3 components that we need to discuss are 1) tasks (including `Wakers`, the
handle that the event system can use to schedule a task to be polled), 2) a "reactor" or some kind
of integration between tasks & the `Poller` we wrote earlier, and finally the executor, which is
probably the simplest component, as it just needs to own a queue of tasks and poll them in a loop.

## Tasks

I'll begin with Tasks, as everything else we discuss will need to interact with them. A task really
needs to be able to do two things:

1. Implement the `Waker` interface so that we can pass a handle to it down the Russian nesting doll
   of futures so that when a given future needs to register itself with the event system, it can
   give the event system a pointer to the task that owns it so we know what to wake up when an event
   comes in.
2. Hold onto the outermost doll of the Russian nesting dolls so that when the executor says "try to
   make some progress" we know what to poll.

Let's start by defining our `Task`:

```rust
/// Logical piece of work that can be scheduled on a single-threaded executor.
pub struct Task<'a> {
    /// A pointer to the executor's queue of tasks.  A `Task` can push itself onto this queue when
    /// it is woken up in order to schedule itself to be polled.
    executor_queue: ConcurrentQueue<Arc<Task<'a>>>,
    /// A pointer to the top-level future that this `Task` must poll in order to make progress.
    task_future: RefCell<TaskFuture<'a>>,
}
```

In this definition, `executor_queue` is just a queue of work that we can push onto in order to
schedule ourselves with the executor. `ConcurrentQueue`is a thin wrapper around an
`Arc::RwLock<VecDeque>`. `task_future`is a handle to the top-level future that we need to be able to
poll. Here's the definition of that:

```rust
/// Wraps a top-level task future to 1) `Pin` it so that it can be polled across multiple
/// iterations of the executor's event loop and 2) track the last poll() response so that we can
/// protect the underlying future from spurious Task wakeups by the executor.
struct TaskFuture<'a> {
    future: Pin<Box<dyn Future<Output = ()> + 'a>>,
    poll: Poll<()>,
}

impl<'a> TaskFuture<'a> {
    fn new<F>(future: F) -> Self
    where
        F: Future<Output = ()> + 'a,
    {
        Self {
            future: Box::pin(future),
            poll: Poll::Pending,
        }
    }

    fn poll(&mut self, cx: &mut Context<'_>) {
        // While `impl Future`s are NOT allowed to be polled after they return `Poll::Ready`, our
        // `Task` _is_ allowed to be woken up spuriously after completion (the scheduling of Tasks
        // is an implementation detail of the executor, which is free to schedule any task whenever
        // it wants), so we need to check the previous Poll result of the underlying future before
        // calling it.
        if self.poll.is_pending() {
            self.poll = self.future.as_mut().poll(cx);
        }
    }
}
```

As mentioned in the comment, the main purpose of making a special kind of top-level pointer to a future
is to handle spurious wake-ups from our executor (since real `impl Future`'s are not allowed to be
polled after they return `Poll::Ready`, but we need our executor to be able to poll tasks after they
are done), and also to make the top-level future `Unpin` to save ourselves some headaches down the
line. If you're interested in what those headaches are, I'd recommend
[fasterthanlime's blog post, "Pin and Suffering"](https://fasterthanli.me/articles/pin-and-suffering),
which explains pinning (and the point of pinning with respect to futures), far better than I can
here. The downside of wrapping every top-level future in a `Pin<Box>` is that now we can't store
tasks on the stack, but the upside is that it makes our code a lot simpler and requires less
`unsafe` blocks.

Back to our `Task` struct definition, we really only need 3 functions, `poll`, which is what the
executor will call on each tick of the event loop (if the task is scheduled), `spawn`, which is a
constructor that will create a new task and push it onto the executor's work queue, and finally
`schedule`, which will be called from the event system.

Here's the definition of those 3 functions:

```rust
impl<'a> Task<'a> {
    /// Polls the underlying top-level future to make progress on the task's work.
    pub(crate) fn poll(self: Arc<Self>) {
        let self_ptr = Arc::into_raw(self.clone()).cast::<()>();
        let waker = unsafe { Waker::from_raw(RawWaker::new(self_ptr, create_arc_task_vtable())) };
        let mut context = Context::from_waker(&waker);

        self.task_future.borrow_mut().poll(&mut context);
    }

    /// Creates a new task and places it onto the executor's event loop by pushing onto the passed
    /// `executor_queue`.
    pub(crate) fn spawn<F>(future: F, executor_queue: &ConcurrentQueue<Arc<Task<'a>>>)
    where
        F: Future<Output = ()> + 'a,
    {
        // Safety(clippy::arc_with_non_send_sync): it is safe for `Task` to not be Send + Sync,
        // because it will only ever be mutated (polled) from a single thread (the thread the executor
        // is on).  It still needs to be wrapped in an `Arc`, however, for following reasons:
        //
        // This task implements `Waker` by means of the RawWakerVTable struct formed in the
        // `schedule` function.  `Waker` is Send + Sync, meaning that the following operations can
        // be called from multiple threads: `clone()` (in `schedule()`) above, and `wake_by_ref()`,
        // which maps via the VTable to `schedule`.  So even though multiple threads can never poll
        // a Task at the same time, or schedule a task at the same time (because `ConcurrentQueue`
        // protects its operations with a `RwLock`), multiple threads _can_ increment the reference
        // count on this smart pointer, and it therefore must be an Arc.
        #[allow(clippy::arc_with_non_send_sync)]
        let task = Arc::new(Task {
            task_future: RefCell::new(TaskFuture::new(future)),
            executor_queue: executor_queue.clone(),
        });

        executor_queue.push(task);
    }

    /// Schedules the task onto the executor queue so that it will be polled on the next tick of the
    /// executor's event loop.
    fn schedule(self: &Arc<Self>) {
        self.executor_queue.push(self.clone());
    }
}
```

### Digression: wakers & multi-threading

You'll notice that we're wrapping every Task in an `Arc` before pushing it onto the executor queue,
and that we have a lot of comments on making a `Waker` Send + Sync. There's two questions here:

1. Why do we care about atomic reference counts for our tasks in a single-threaded runtime?
2. Why does the `Send + Sync`-ness of `Waker` matter to us here, since we're writing a Task, not a
   Waker?

#### Multi-threaded task scheduling

First of all, while we are writing a single-threaded runtime (meaning that every task will be
_executed_ on a single thread, that doesn't necessarily mean that all tasks will be _scheduled_ from
a single thread.

A good example would be I/O operations on regular files. While we have a nice API for getting
readable events on files via `kqueue`, unfortunately, it doesn't really work the way we want for
regular files. From the man pages for `kqueue` from the section on `Vnodes`:

> Returns when the file pointer is not at the end of file. data contains the offset from current
> position to end of file, and may be negative.

So kqueue will report a file being readable whenever the file pointer is not at the end of the file,
_not_ when a `read()` on the file would not block: what if the file system was an NFS and the actual
bytes were half way across your building in another computer? `read()` might block for a while. Due
to these limitations in `kqueue`and similar APIs like `epoll`, most async I/O libraries have a
blocking threadpool for operations like this that we have to "cheat" on. Even the glibc
implementation of the `aio` interface (which advertises itself as "system calls for asynchronous
I/O") on my machine simply manages a thread pool under the hood to emulate kernel-level async I/O.

As a result, we need to support tasks being _scheduled_ from multiple threads even if we promise to
only ever run them on one.

#### Wakers

What's a `Waker`? In the JavaScript example above, whenever we registered an event, we also
registered the task that should be woken up when the event happened. That's all a `Waker` is:
_something_ that has methods on it like `wake()` and `wake_by_ref()` that schedule a future to be
polled. In our case, `Waker` is just a special kind of smart pointer that calls our Task's
`schedule` method whenever it's woken up.

The `Waker` can be accessed on the `Context`struct reference that is passed to every `Future`'s
`poll` method: `fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>`.
`Context` has a method on it called `waker()` that returns the `Waker` struct that should be used to
wake up the future that's being polled.

When you hear "implement the `Waker` interface," you might be thinking that `Waker`is a trait that
we can implement. While some third-party crates do provide traits for wakers, like the `ArcWaker`
trait from `futures`, we don't want to use any 3rd party dependencies, so we need to create it
ourselves, using something called a v-table. A v-table, or virtual function table, is just a
collection of pointers to functions that implement a given interface. It's how dynamic dispatch
works in every language, but Rust mostly keeps the details of it out of your way thanks to Traits,
at least in everyday usage. Nevertheless, keep in mind that whenever you pass something like a
`Box<dyn Trait>`to a function, you're passing a heap-allocated v-table, and if you ever hear someone
talk about how generics & mono-morphism in Rust is cheaper than dynamic dispatch & fat pointers,
that's what's going on there. Anyway, for `Waker`, however, we need to implement the table ourselves
via something called `RawWakerVTable`, provided by the Rust standard library in the `std::task`
module.

To re-cap our goals here: we need to create a `std::task::Waker` instance with a pointer to a
v-table that has functions in it such that when a future calls `waker.wake_by_ref()` what _actually_
gets called is our `Task::schedule` function. We're going to be working through these lines of code
here:

```rust
/// Polls the underlying top-level future to make progress on the task's work.
pub(crate) fn poll(self: Arc<Self>) {
    let self_ptr = Arc::into_raw(self.clone()).cast::<()>();
    let waker = unsafe { Waker::from_raw(RawWaker::new(self_ptr, create_arc_task_vtable())) };
    let mut context = Context::from_waker(&waker);

    self.task_future.borrow_mut().poll(&mut context);
}
```

That `create_arc_task_vtable` function returns the following struct, defined by the standard
library:

```rust
pub struct RawWakerVTable {
    clone: unsafe fn(*const ()) -> RawWaker,
    wake: unsafe fn(*const ()),
    wake_by_ref: unsafe fn(*const ()),
    drop: unsafe fn(*const ()),
}
```

You'll notice that it's basically expecting our definition of this to behave like a smart pointer,
which is exactly what a `Waker` is. It's a smart pointer that keeps a reference count around to
whatever it's pointing to so that we can cheaply clone our wakers without cloning the entire
underlying `Task`that it points to (something we'll see in action later when we start passing wakers
to our event system). So the first thing we need to do is turn the `Arc` that we have into the raw
`*const ()` (Rust's version of a `void *`) that the v-table expects. That's what `Arc::into_raw()`
does.

Next we need to create a `Waker` from a `RawWaker` instance, which simply takes a raw pointer (the
thing that the v-table functions will get called with), and the v-table itself. That's what
`Waker::from_raw(RawWaker::new(self_ptr, create_arc_task_vtable()))` does.

Let's implement these functions now. The first thing we need to do is implement `clone`. You might
think, well, `Arc` already has a `clone`method, so this shouldn't be too difficult, right? Well,
`Arc` has another special behavior, which is that it's `Drop` implementation (which gets called when
it goes out of scope) _decrements_ the pointer that `clone` increments.

So while we might be tempted to write something like this:

```rust
unsafe fn clone_arc_task_raw(data: *const ()) -> RawWaker {
    let _arc = Arc::from_raw(data.cast::<Task>())).clone();
    RawWaker::new(data, create_arc_task_vtable())
}
```

We would have achieved absolutely nothing, because as soon as `_arc` went out of scope, the
reference count incremented by `clone`will be decremented. Thankfully we can tell the Rust compiler
to never call `Drop`by using a builtin called `ManuallyDrop`. Any type wrapped in `ManuallyDrop`
will never be dropped automatically: you're telling the compiler that you will manually handle
calling the drop implementation (which we will do in our drop function later).

With that out of the way, the final version of our `clone` function for our v-table looks like this:

```rust
unsafe fn clone_arc_task_raw(data: *const ()) -> RawWaker {
    // Create an arc, then increase the underlying refcount by calling `clone`, but wrap in
    // `ManuallyDrop` so that Arc::drop isn't called with these `_arc` and `_arc_clone` variables
    // goes out of scope at the end of the function.
    let _arc = mem::ManuallyDrop::new(Arc::from_raw(data.cast::<Task>()));
    let _arc_clone: mem::ManuallyDrop<_> = _arc.clone();
    RawWaker::new(data, create_arc_task_vtable())
}
```

Now we can write the corresponding function, which is where we fulfill our promise to the compiler
to handle calling `drop`:

```rust
unsafe fn drop_arc_task_raw(data: *const ()) {
    drop(Arc::from_raw(data.cast::<Task>()));
}
```

That takes care of the smart pointer functionality of `Waker`, now we just have `wake` and
`wake_by_ref`. Both of them just need to call `Task::schedule`, the only difference is that `wake`
takes an owned `self` argument, so the semantics of the functions are, "if you call `wake()` you're
_consuming_ the waker (meaning that we expect the smart pointer reference count to be decremented),
but if you call `wake_by_ref()`, you have a _shared reference_ to the `Waker`, so the total
reference count should not change." We can use `ManuallyDrop` again to enforce these semantics:

```rust
unsafe fn wake_arc_task_raw(data: *const ()) {
    let arc = Arc::from_raw(data.cast::<Task>());
    // We don't have any special difference between wake_by_ref() and wake() in our task because
    // we're using Arc, so we just call the same function both times.
    Task::schedule(&arc);

    // This function is called when you use the `wake(self)` function, so the expectation is that
    // you have consumed the Waker by calling this function.  Therefore we _want_ `Drop` to be
    // called on this Arc in order to decrement the ref-count after this function is called.
}

unsafe fn wake_arc_task_by_ref_raw(data: *const ()) {
    // This function is basically identical to `wake_arc_task_raw` but it means that you called
    // `wake_by_ref(&waker)`, which means that you _aren't_ consuming the `Waker`, which means we
    // should _not_ decrement the underlying Arc refcount when you call this function.  So we do the
    // same as above, but we wrap the Arc in a ManuallyDrop.
    let arc = mem::ManuallyDrop::new(Arc::from_raw(data.cast::<Task>()));
    Task::schedule(&arc);
}
```

They're both exactly the same, other than that one uses `ManuallyDrop` and the other one doesn't, in
order to set the reference based on the semantics of the function.

With all that done, we can just return pointers to these 4 functions to create a
`&'static RawWakerVtable`:

```rust
fn create_arc_task_vtable() -> &'static RawWakerVTable {
    &RawWakerVTable::new(
        clone_arc_task_raw,
        wake_arc_task_raw,
        wake_arc_task_by_ref_raw,
        drop_arc_task_raw,
    )
}
```

Now we can create Wakers from our Tasks! The usefulness of this will become clear presently.

#### Digression from a Digression: Raw Pointers & Address-sensitive states

How do we create an `Arc` from a raw pointer at all? And what does all this have to do with Pinning?
If you read the "Pin and Suffering" article [referenced above](https://fasterthanli.me/articles/pin-and-suffering) (which I heartily recommend), there is
an example towards the end showing what would happen if you swapped two `!Unpin` futures and then
polled them. Now that you know how wakers work, we can see what's happening under the hood in that
example.

`Arc::from_raw` takes in a `*const ()`, which is just a `usize` with an address in it. Let's call it
`0x1234`, ignoring the real world constraints of alignment, etc. The compiler knows the precise size
of an `Arc`. Let's say that an `Arc` is defined something like the following:

```rust
struct Arc<T> {
	ref_count: AtomicUsize,
	data: *const T
}
```

Let's also say that `ref_count` is 4 bytes long. That means that if we have the address of `data`,
then we can just subtract 4 to get to the start of the `Arc` (once again naively ignoring
alignment). So (unsafely), given a raw pointer with a value of `0x1234`, we can get back to the
original `Arc` at `0x1230` quite easily.

However, this also makes the danger of raw pointers clear: what happens when the thing that the
pointer is pointing to _moves_? Then you subtract 4 bytes from `0x1234` and you get...some random
heap memory. Maybe a pointer half way into some other struct. Maybe nothing. Who knows. Almost
certainly not a valid `Arc`. Even if by some miracle you got an `Arc`, it wouldn't be _your_ Arc,
it'd be the Arc from some other task.

Making sure things don't move like this is the point of the Rust `Pin` API. Most of the time you
don't need it because your structs are not in an "address-sensitive state" like this. But when they
are, like when you're handing out references to raw pointers, then you can use `Pin` to enforce that
the thing that the pointers point to can't be moved. I'm mostly punting on designing around pinning
in my runtime for simplicity, but it's important in the real world, especially when you don't wrap
your tasks futures in `Pin<Box>`, and is also the reason why the `Future` trait's `poll` method
takes a `Pin<&mut Self>` instead of just a `&mut self`.

## Reactor: associating wakers and events

Now that we know how to create wakers, we can use them somewhere. We already have a `Poller`
interface, but we don't know what `Task` to wake up when an event is ready. We'll write that
functionality using a new struct called `Reactor`, which will maintain a map from events to wakers.
We could have built this functionality directly into our `Poller`, of course, but I think it's a
little easier to maintain when the responsibility is divided.

As always, we'll begin with the definition of our `Reactor`:

```rust
/// Represents a struct that maps events to wakers.  Futures can get a reactor in order to register
/// their waker with some event that they care about.
pub(crate) struct Reactor {
    /// Binding to OS async I/O implementation
    poller: Poller,

    /// Storage for events when polling the `Poller`.  Has to be wrapped in a Mutex because we need
    /// Reactor to be a static singleton, and so Rust expects it to be Sync.  In practice, because
    /// this is a single threaded runtime, this lock could never be competed for.
    events: Events,

    /// Maps from event keys to wakers to wake up when we get an event of that key
    waker_map: HashMap<usize, Waker>,

    /// The current event key to use for new events
    current_key: usize,
}

thread_local! {
    /// Thread-local Reactor. This type is not Sync: it's not safe to share between threads.  That's ok
    /// because when a Waker (which can be shared between threads) schedules work, that's all it
    /// ever does: schedules the work.  Because we have a single-threaded runtime, we can guarantee
    /// that all futures in our system will only ever be polled from a single thread, and it's the
    /// act of _polling_ (not scheduling) a future which uses the Reactor.  Therefore we can
    /// conclude that this type will never be accessed from anything other than the main futures
    /// thread, and this is safe.
    pub static REACTOR: RefCell<Reactor> = RefCell::new(Reactor {
        poller: Poller::new().expect("could not initialize OS async i/o context"),
        events: Events::new(),
        waker_map: HashMap::new(),
        current_key: 0
    });
}
```

The most interesting thing here is the `thread_local!` and the associated comment. When a future
wants to register itself with the event system, it needs a way to get a reference to the map that
the reactor owns. We also need to make sure that every event has a unique key to use to register
with the `Poller`. The easiest way to satisfy both of these constraints is to make our reactor a
thread-local singleton. It's thread-local, meaning that a given instance will be local to a single
thread, making it safe to use `RefCell` and not `RwLock`, and since the reactor will only ever be
used from a single thread anyway, we'll only ever have one instance of it.

Now our reactor just needs a few functions for registering & de-registering events with the
`Poller`that it owns, and finally a method for blocking until one of the tasks in its map has an
associated event become active:

```rust
impl Reactor {
    /// Registers a socket file descriptor with the reactor to wake up the passed `Waker` when an event of
    /// type `Event` becomes availble on the socket.
    pub(crate) fn register_socket(
        &mut self,
        waker: Waker,
        socket: BorrowedFd<'_>,
        event: SocketEvent,
    ) -> io::Result<()> {
        let key = event.key;
        self.poller.register_socket(socket, event)?;
        self.waker_map.insert(key, waker);

        Ok(())
    }

    /// Registers a timer with the reactor to wake up the passed `Waker` when the amount of time
    /// specified by the `TimerEvent` elapses.
    pub(crate) fn register_timer(&mut self, waker: Waker, event: TimerEvent) -> io::Result<()> {
        let key = event.key;
        self.poller.register_timer(event)?;
        self.waker_map.insert(key, waker);

        Ok(())
    }

    /// Deletes interest in a particular event key.  Once all event keys are de-registered,
    /// Reactor::block_until_events becomes a no-op until more events are registered.
    pub(crate) fn deregister_waker(&mut self, key: usize) {
        self.waker_map.remove(&key);
    }

    /// Block until we receive at least one event that we care about, and call `waker.wake_by_ref()`
    /// on the corresponding `Waker` in our map from event IDs to wakers.  If our map from event IDs
    /// to `Waker`s is empty, this function returns immediately, since even if we had events to get
    /// at the OS level, we would have no tasks to schedule when we got them, so calling this
    /// function without having registered any `Wakers` with it (e.g. through having polled at least
    /// one future that uses this `Reactor` to schedule work), is a no-op.
    pub(crate) fn block_until_events(&mut self) -> io::Result<()> {
        if self.waker_map.is_empty() {
            // if our waker map is empty, then we don't have anything to notify, so there's no point
            // asking the poller to wait forever for no events.
            return Ok(());
        }

        self.events.clear();
        self.poller.wait(&mut self.events)?;

        for event in self.events.iter() {
            if let Some(waker) = self.waker_map.get(&event.key()) {
                waker.wake_by_ref();
            }
        }

        Ok(())
    }

    /// Returns the next event key in a sequence.  This is useful because any given future needs to
    /// get a unique event key for itself, but it doesn't know what other event keys have already
    /// been used, so it can get one from the global Reactor.
    pub(crate) fn next_key(&mut self) -> usize {
        let x = self.current_key;
        self.current_key += 1;

        x
    }
}
```

## Executors, the final puzzle piece

We now have a Task abstraction, which represents a top-level unit of work that we can execute, and
we have a reactor, which we can use to register a special kind of smart pointer to tasks called a
`Waker`, and associate those `Wakers` with their associated I/O events. So, the last piece of the
JavaScript example from above that we have to implement is the for-loop all the way at the bottom
that actually polls the queue of work that the tasks have been pushing themselves onto with the
`schedule` function.

This is arguably the simplest part of the entire runtime. (For our runtime, at least. Note that in
general the problem of "how to most efficiently schedule tasks" can get complicated, and so things
like `tokio`'s executor are considerably more complex). For our use-cases, we just need a
`ConcurrentQueue`to store tasks in, and then a function to loop over the tasks and block on the
event system whenever we're totally out of work to do:

```rust
/// Executor for our `Task`s that maintains a work queue of top-level `Tasks` and polls whichever
/// ones are scheduled, in response to OS events from our Reactor.  Note that tasks are responsible
/// for scheduling themselves when their `Waker` is woken up by the Reactor during
/// `block_until_events`.
pub struct Executor<'a> {
    queue: ConcurrentQueue<Arc<Task<'a>>>,
}

impl<'a> Executor<'a> {
    /// Creates a new `Runtime` that can execute `Task` instances.
    pub fn new() -> Self {
        Self {
            queue: ConcurrentQueue::new(),
        }
    }

    /// Spawns a new top-level `Task` by pushing it onto our queue of work that will be polled on
    /// the next tick of the event loop
    pub fn spawn<F>(&self, future: F)
    where
        F: Future<Output = ()> + 'a,
    {
        Task::spawn(future, &self.queue)
    }

    /// Blocks the thread until all scheduled work has been run to completion: i.e. every `Task` we
    /// know about has returned Poll::Ready
    pub fn block_until_completion(&self) {
        loop {
            // Make progress on everything that we can:
            while let Some(task) = self.queue.pop() {
                task.poll();
            }

            // Then block until we have at least one event that we care about:
            reactor::REACTOR.with_borrow_mut(|r| r.block_until_events().unwrap());

            // Finally, if blocking for events didn't result in any work being pushed onto our
            // queue, then we are done:
            if self.queue.empty() {
                break;
            }
        }
    }
}
```

## Seeing it in action

With that completed, we now have a complete async runtime. But before we can actually write a
program with it, I'd like to digress again and talk about some syntactical details around the
`Future` trait and the `async`/`await` keywords.

In our simple JavaScript example, we had a class called `Task`that maintained a state machine. If
you've ever written async Rust, you've probably never written anything that looked remotely like
that class, so you may be wondering where these state machines are coming from. This is actually the
point of `async/await` syntax: they save you from building state machines. You could certainly
install a low-level async I/O library like `mio`, write out the state machines yourself, and
accomplish everything that you can today without any usage of `async` or `await`, but it makes your
code a lot simpler to give it the illusion of linearity with keywords like `await`. Just to make the
point, let's take a look at a simple `tokio` program:

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    sleep(Duration::from_secs(1)).await;
    sleep(Duration::from_secs(2)).await;
}
```

An async function is simply a regular Rust function that returns an `impl Future`, i.e. some type
that implements the `Future` trait interface, which is what contains the `poll` function we've been
referencing. The future returned by _this_ async function in particular is a state machine much like
our `Task` class from JavaScript, but auto-generated by the Rust compiler.

The `tokio` documentation
[has an excellent example of what this compiles to](https://tokio.rs/tokio/tutorial/async#async-fn-as-a-future).
To further illustrate the point, we can actually use the Rust compiler to generate a high level
representation of the IR that this syntax generates. Compiled to HIR
(high-level-intermediate-representation) in the nightly version of the Rust compiler, we get an
output like the following:

```rust
#[prelude_import]
use std::prelude::rust_2021::*;
#[macro_use]
extern crate std;
use ::{};
use tokio::time::sleep;
use tokio::time::Duration;

fn main() {
  let body =
    |mut _task_context: ResumeTy| {
      match #[lang = "into_future"](sleep(Duration::from_secs(1))) {
        mut __awaitee =>
          loop {
            match unsafe {
              #[lang = "poll"](#[lang = "new_unchecked"](&mut __awaitee),
              #[lang = "get_context"](_task_context))
            } {
              #[lang = "Ready"] {  0: result } => break result,
              #[lang = "Pending"] {} => { }
            }
            _task_context = (yield ());
          },
      };
      match #[lang = "into_future"](sleep(Duration::from_secs(2))) {
        mut __awaitee =>
          loop {
            match unsafe {
              #[lang = "poll"](#[lang = "new_unchecked"](&mut __awaitee),
              #[lang = "get_context"](_task_context))
            } {
              #[lang = "Ready"] {  0: result } => break result,
              #[lang = "Pending"] {} => { }
            }
            _task_context = (yield ());
          },
      };
    };

  #[allow(clippy::expect_used, clippy::diverging_sub_expression)]
  {
    return tokio::runtime::Builder::new_multi_thread().enable_all().build().expect("Failed building the Runtime").block_on(body);
  }
}
```

All the obscure `lang_items` from the HIR notwithstanding, it's not difficult to see the overall
state machine pattern emerge.

In other words, the `async`/`await` keywords are simply utilities that the Rust language gives us
for compiling what look like simple functions into `impl Future`'s.

Knowing that, we can test out our runtime by building a simple future ourselves that we can await.
We can start with a `Timer`:

```rust
/// Future returned by [`sleep`](sleep).
pub struct TimerFuture {
    deadline: Instant,
    event_key: Option<usize>,
}

impl Future for TimerFuture {
    type Output = ();

    fn poll(
        mut self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        if Instant::now() >= self.deadline {
            if let Some(key) = self.event_key {
                reactor::REACTOR.with_borrow_mut(|r| {
                    r.deregister_waker(key);
                });
            }

            Poll::Ready(())
        } else {
            // Register an event with the global reactor that says "wake me up when this timer
            // fires"
            reactor::REACTOR.with_borrow_mut(|r| {
                let duration_until_deadline = self.deadline - Instant::now();

                let key = self.event_key.unwrap_or_else(|| {
                    let key = r.next_key();
                    self.event_key = Some(key);
                    key
                });

                r.register_timer(
                    cx.waker().clone(),
                    TimerEvent::new(key, duration_until_deadline),
                )
                .expect("could not register timer with async i/o system");
            });

            Poll::Pending
        }
    }
}

/// Puts the current task to sleep for at least the specified `Duration`.  Note that waking up the
/// task after this duration has elapsed is done on a best effort basis: if some other task is
/// greedily blocking the thread then this future will not be polled again until after that other
/// task relinquishes its hold on the thread.
pub fn sleep(duration: Duration) -> TimerFuture {
    // Check if the duration is representable with an `Instant` and if not replace it with some
    // ridiculously long time
    match Instant::now().checked_add(duration) {
        Some(deadline) => TimerFuture {
            deadline,
            event_key: None,
        },
        // 30 years
        None => TimerFuture {
            deadline: Instant::now()
                .checked_add(Duration::from_secs(36400 + 365 + 30))
                .unwrap(),
            event_key: None,
        },
    }
}
```

We have a function called `sleep` that returns a struct called `TimerFuture` that registers itself
with the `Reactor`, saying "please wake me up when the following timer event is available." We call
`cx.waker().clone()` to pass that special smart pointer & v-table we created earlier into our
reactor, and then on the next tick of the event loop after the duration we specified passes, the
reactor, inside its `block_until_events` function that the executor calls, will call
`waker.wake_by_ref()`, which will call `Task::schedule()`, which will push onto the `executor_queue`
held by our executor, which will then be polled by our executor, which will poll our top level Task,
which will poll this future that it holds onto via its `task_future` property, which will see that
`Instant::now()` is after the deadline specified, and it will return `Poll::Ready`. Our Rube
Goldberg machine will have accomplished something.

With that done, we can finally write a simple program in Rust, using `async/await` and everything
else, that does much what our JavaScript program did before: run a couple of futures concurrently.

```rust
use std::time::{Duration, Instant};

fn main() {
    let runtime = lilfuture::executor::Executor::new();

    runtime.spawn(async {
        println!("starting timer 1");
        lilfuture::time::sleep(Duration::from_secs(1)).await;
        println!("timer 1 is done");
    });

    runtime.spawn(async {
        println!("starting timer 2");
        lilfuture::time::sleep(Duration::from_secs(1)).await;
        println!("timer 2 is done");
    });

    let now = Instant::now();
    runtime.block_until_completion();

    println!(
        "Runtime ran two timers for 1 second each, but total runtime was {}ms, meaning they ran 'concurrently'",
        now.elapsed().as_millis()
    )
}
```

If you run this, we'll see that the total time of the system is around 1 second, even though we ran
two 1 second timers. Concurrency!

## Wrapping Up

All the pieces that I talked through above are available in full in the
[lilfuture](https://michaelhelvey/lilfuture) repository, along with a lot of additional code to get
some more interesting demos working, like an echo server built on top of async TCP streams.

While I'm pretty sure that my little runtime is probably subtly wrong in a few ways that I haven't
realized yet, and while I've used async systems for years and had a pretty good grasp on the
concepts behind green threads, coroutines, and the like, building one in Rust for the first time
taught me a lot about Rust that I'd never had to dive into before. For example, a few highlights for
me:

- Pinning. I learned there's a pretty big difference between how much I needed to know about pinning
  as a Rust user compared to as a Rust library author.  Frankly, I still have quite a bit more to
  learn in this area, I think.
- Reading HIR in the Rust playground. I hadn't done that before.
- Implementing v-tables using raw pointers. This is something I've done plenty of times in
  languages like C or Zig, but never Rust. It still felt pretty ergonomic, to be honest.
- Learning the `kqueue` API. I've read the docs for `epoll`and `kqueue` before but never programmed
  with them directly.
- Reading the `tokio` source code more thoroughly, and learning how it integrates with lower level
  libraries like `mio`. Same for alternative runtimes like `smol-rs`, from which I learned a lot
  (and on which a decent bit of my `Poller`and `Reactor` code is loosely based). Overall I think I'm
  a better user of those libraries because of this project.

Finally, I think that there's definitely different levels of understanding something, and I
think that building an async runtime from scratch gave me a better intuition about async programming
in general, no matter how much I thought I knew about it from other languages. I'd definitely
recommend this as a project if you're looking to level up your skills in async Rust. Getting
something real working is fairly doable, and very satisfying.

### References

Here's a collection of blog posts, projects, and documentation that I've read either over the years
or during this project, that have influenced how I think about async Rust, in no particular order or
hierarchy:

**Articles**:

- https://blaz.is/blog/post/future-send-was-unavoidable/
- https://matklad.github.io/2023/12/10/nsfw.html
- https://blaz.is/blog/post/lets-pretend-that-task-equals-thread/
- https://without.boats/blog/why-async-rust/
- https://without.boats/blog/thread-per-core/
- https://fasterthanli.me/articles/pin-and-suffering
- https://corrode.dev/blog/async/
- https://maciej.codes/2022-06-09-local-async.html

**Code:**

- https://github.com/smol-rs
- https://github.com/tokio-rs/mio
- https://github.com/tokio-rs/tokio

**Videos**:

- https://www.youtube.com/watch?v=DkMwYxfSYNQ
- https://www.youtube.com/watch?v=ThjvMReOXYM
