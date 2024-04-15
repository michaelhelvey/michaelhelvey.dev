---
layout: ../../layouts/PostLayout.astro
title: "Table-Driven Development"
subtitle: "Use table-like datastructures to express your code as data and limit error-prone logic."
date: "November 29, 2022"
---

Have you ever written code that looked like this?

```ts
enum Foo {
	first = 'first',
	second = 'second',
	third = 'third'
}

/**
 * Given some string, determines what kind of "Foo" it is.
 */
function classifyFoo(value: string): Foo {
	if (value === 'foo') {
		return Foo.first
	} else if (value === 'bar') {
		return Foo.second
	} else if (value === 'baz') {
		return Foo.third
	} else {
		throw new Error(`Could not deserialize value '${value}' into Foo')
	}

}
```

I certainly have. It's a fairly common pattern to have to serialize and deserialize types like this
between module boundaries in your code. Maybe the `value` that you're deserializing into `Foo` is
coming from an API response, or a database. Either way, you have to validate it and transform it
into your enum.

Before talking about tables, note that you could write almost identical code using a switch
statement:

```ts
function classifyFoo(value: string): Foo {
	switch(value) {
		case 'foo':
			return Foo.first
		case 'bar':
			return Foo.second
		case 'baz':
			return Foo.third
		default:
			throw new Error(`Could not deserialize value '${value}' into Foo')
	}
}
```

This is a little better, because at least Typescript can help you by statically figuring out whether
the `switch` statement is exhaustive. But either way, the code is quite repetitive. But most
importantly, code like this is **difficult to change, and easy to get wrong**.

It's difficult to change because code like this is hard to abstract. If you add a new value to the
`Foo` enum, you have to add a new branch to your function. Also, in my experience, code like this
tends to not just stay in once place either -- it tends to infect the rest of your codebase with
other, similar if/switch statements, because code like this is difficult to share. It's easy to
start slipping side-effects into the branches of your if-statements.

It's also easy to get wrong -- every `if`, and every `switch` case statement, represents a branch in
the logic of your program. Every branch is an opportunity to get it wrong. For example, it's harder
for static analysis tools like Typescript to know if you've mapped every value correctly, or if
you're handling every possible case.

## Code as data

What's the solution? I'm going to take a page out of functional programming's book and and talk
about **code as data**. In other words, given that most of the code we write can be expressed as a
function, mapping some set of inputs to another set of outputs, we can express that mapping
_declaratively_ using, well, a `Map`.

I'll put that a little more concretely. Let's say you're writing an HTTP-based API. Ultimately
(since HTTP is a stateless protocol), you might be able to model your entire application as a pure
function: `(httpRequest) -> [httpResponse, sideEffects]` (where `sideEffects` might be writes to a
database, or external API calls). Of course it's never _entirely_ pure, but this captures the
essence of it, in a perfect world. You'll also have stateful driver code needed to run that server
on an operating system, connect to databases, etc, but the essence of your program is still a pure
function.

(Side note: if you're ever written Haskell, you'll know that this is literally how Haskell models
all programs. To make anything "happen" in the outside world you use something called the IO monad
-- basically just the `sideEffects` type above that hooks into the runtime.)

So go go back to our example above, what happens if we model the mapping explicitly as a map?

```ts
/* prettier-ignore */
const valueToFooMapping = new Map(
	["foo", Foo.first],
	["bar", Foo.second],
	["baz", Foo.third]
)
```

Now look how easy it is to "parse" a given value:

```ts
const classifyFoo = (value: string) => valueToFooMapping.get(value)
//     ^? (string) => Foo | null
```

Want to know if a given value is a valid `Foo`?

```ts
const isValidFoo = (value: string) => valueToFooMapping.has(value)
//      ^? (string) => boolean
```

Note that as our enum grows, the only logic we have to update is the declarative mapping expressed
in `valueToFooMapping`. And that's what "declarative" really means -- "declaring" state statically
rather than through logic.

Note that as well, from a performance perspective, (at the cost of the initial map allocation),
we've improved the performance of our code from `O(n)` to `O(1)`, meaning that we will incur no
performance cost by growing the size of our enum.

(Side note: I think `Map` and `Set` are really under-used types in modern Javascript. They have tons
of useful methods on them, and come with performance benefits, that plain `Objects` don't have. But
more on that later.)

## Wrapping Up

Naturally, the example above was fairly trivial. In the real world you probably wouldn't even be
writing manual serialization/deserialization code -- you'd be using an ORM or a library like `zod`
to model the relationship between strings and an enum.

Once you start thinking of your programs as functional mappings, I think you'll start seeing this
pattern everywhere. Many, many switch statements or if-statments could be better modeled as
declarative maps, along with logic that operates on those maps.

Finally, although this probably goes without saying, use this pattern with wisdom. In a language /
in situations where performance matters, of course allocating a map will be terrible. The ultimate
goal is always working, readable code, so when `if` statements produce better working, more readable
code, by all means use them instead. The goal of this post is simply to provide a simple example of
another option that _can_ simplify large config-like blocks of if statements in some situations.

---

**Notes**:

_While the code above is written in Javascript, my thoughts on code structure like this have been
moulded by two other languages in particular:_

- [Clojure](https://clojure.org/)
  - Clojure, along with the other Lisps, are big on modeling code as data. With a Lisp, you'll find
    yourself writing more maps and linked lists, and composing your program out of small functions
    that operate on them, than you ever thought possible.
- [Haskell](https://www.haskell.org/)
  - Haskell, while presenting a far more theory-heavy interface to functional-programming, is
    excellent for really understanding functional programming paradigms (though less excellent for
    building real-world applications). For an easy-to-read introduction, I've found the book
    [Learn You A Haskell For Great Good](http://www.learnyouahaskell.com/) to be an excellent
    introduction to the ecosystem.
