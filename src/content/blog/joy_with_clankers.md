---
title: "Finding Joy In A World Of Clankers"
subtitle: "How I use LLMs at the end of 2026"
date: "October 11, 2026"
---

_Note: the following piece is about my personal experience of programming with LLMs. It's not at all
intended to be a blanket philosophy of LLMs and humanity, or reflective of the massive sociological,
ecological, and cultural problems that LLM usage is creating in our society._

_Note: I did not write a single world of this with an LLM. I use semicolons and em-dashes in
real-life. Stop it._

For most of the last 4 years, I've hated LLMs. Well, that's not quite fair; I hate the people who
talk endlessly about LLMs, about this prompt and that skill set, about the latest way to burn
billions of tokens without contributing anything useful to their field or human life. What I hate
most of all is the gleefulness with which they proclaim the death of programming, the atrophy of
their skills (which I often doubt ever existed in the first place), as if they've spent their whole
careers in software anxiously awaiting a time when they no longer had to actually practice their
craft at all. I have no understanding or sympathy for these people.

But I don't really hate LLMs. For most of their still very short history, I've hated the experience
of working with them, but that's not quite the same. For most of the last few years, LLMs have
produced shockingly bad code, and it's been much easier to just write it yourself, if you care about
quality at all. This has meant that most of the time, I exist in basically one of two modes: total
apathy about what I work on, incapable of valuing the software that I'm creating, because I'm using
an LLM, or, if I do value what I'm working on, not using an LLM at all in any capacity. Most of the
time this has meant a total refusal to use LLMs on my personal projects -- not because using an LLM
would invalidate them in some way, but because I was incapable of using LLMs without giving up on
the quality and care that I want out of the things that I make. I want to be proud of my work, and
for most of the history of LLMs, I haven't been able to use them while being proud of my work.

But over the last year, that's changed to a degree, and I want to write a bit about why.

First of all, the models have gotten a lot better. This results in two main things in my experience:
firstly, I don't spend 99% of my time, when engaging with the LLM, in fighting with the horrible
code that it produces. I find that if I express how I think code should be written carefully enough,
and if I write enough of the code myself (and of course carefully review the model's output), I'm
able to produce the software that I want, to the same degree of quality that I would expect of
myself if I was writing all of it by hand. This is quite satisfying, because I don't have a lot of
time. I have young children, and a lot of personal and professional responsibilities, and the fact
that I'm able to get personal programming projects done again is satisfying. I love programming, and
it makes me happy that I'm able to do it more with the limited time that I have.

Secondly, and perhaps because of the first, I feel like I've gotten a lot better at using LLMs while
not giving up control. As I mentioned above, for a long time in the early days of LLMs, I was either
vibe coding out of total apathy and nihilism, or else just not using LLMs at all. Over the last
year, I feel like I've been able to carve out a middle ground, where I use an LLM to perform some
tasks in my codebase, while still writing code myself (and of course, carefully reading the model's
output). I feel in control of the quality, I feel in control of my own understanding of the code,
and I feel more like I'm doing the kind of work I did before LLMs, just amplified -- I'm able to get
the ideas in my head out into the files faster than before, and by and large, that's a satisfying
experience.

All of this isn't to say that working with LLMs isn't still incredibly frustrating a lot of the
time. They're still incredibly stupid in a lot of ways. I don't really trust people who don't share
this frustration. The people who are YOLO'ing hundreds of pull requests a day into production, while
talking about how nobody reads and writes code anymore, while gleefully proclaiming the end of
software engineering as a discipline -- I hate these people. I feel genuine bitterness in my heart
when they talk about the craft that I fell in love with and practice every day. In order to earn my
trust these days, you need to be able to acknowledge how terrible LLMs and the software they create
often are. A few people that do this really well, and that I've found a lot of inspiration in over
the last year, are [Mario Zechner](https://x.com/badlogicgames) and
[Armin Ronacher](https://x.com/mitsuhiko). Thanks for building pi, thanks for caring deeply about
your craft no matter what tools you use, and thanks for bringing sanity to this whole stupid online
conversation, guys :)

## Addendum: Tool Bias

I don't want to fall into the trap of saying "LLMs aren't the problem, they're just a tool, it's the
people that are the problem." Of course this is true to a degree -- if you produce garbage, that's
your fault, whether you used an LLM or not. But tools have biases, and the bias of LLMs is to phone
it in and not care about your work. When you have a hammer, everything looks like a nail, and when
you have an LLM, everything looks like an excuse to hit approve on the PR and scroll twitter for a
while.

I don't know the solution to this. But I want to acknowledge that it exists, and that dealing with
the perverse, anti-human tendencies of LLMs is going to be one of the great struggles of future
generations.

## Addendum: Craftsmanship

I think that I would be remiss writing all this without leaving some thoughts about craftsmanship,
or humanism in this world of clankers. After all, the point of all this isn't software. Nothing
we're building actually matters in an ultimate sense; the value that it has comes only from the
degree to which it improves human life or, like art, reflects the human experience and soul in some
way. Some people argue that LLMs destroy the point of writing code by hand because they can achieve
the same result but faster; I disagree because I don't think that "the result" is fully determined
by the bytes of code in text files; it also in some degree comes from the effort and care put into
it by a human.

I have no interest in listening to music created by an AI, because the entire point of music is that
it's a communication medium between humans. It doesn't matter if it sounds the same. If an LLM was
capable of producing the most perfect fugue (which in some cases, they now are), I still would never
listen to it instead of Bach, because the point is that Bach, a fellow human now long dead, is
_communicating with me through his music._ The sound isn't the point; the person is.

I think there's a degree to which this is true of software as well, but it's not quite the same.
There's a place for generated software in a way that there's not a place for generated music. Music
is "pure" art, whereas software's value, I would argue, is only partially artistic, but also
partially utilitarian. I think that the process of building software with LLMs is also more human
than a lot of other applications of LLMs. After all, I can write code alongside the LLM, edit the
code that it produces, carefully refactor until the code reaches just the state I had imagined it in
my head. This is not quite true of art, at least as I've seen it used.

I write this to say that I don't think that using LLMs in and of itself destroys the human
craftsmanship of a piece of software in the same way that it does of music or visual art. Of course,
if you use an LLM to generate software without yourself caring about that software, without caring
about the particular lines of code and data structures that it uses, without knowing yourself how it
should be built, naturally that reduces the human value of the software (and I think that's bad!).
But I don't think that LLM usage in and of itself destroys the human value. You can use LLMs and be
a diligent craftsman, or you can use LLMs and be a slop monster. Your users, and your fellow
programmers, will be able to tell which you are by the care evident in what you create.

## Addendum: Realism

If I could press a button and destroy LLMs from the face of the earth, I would. But I can't. I think
their existence is inevitable, at least in the profession that I've chosen to use to pay the bills,
so I'm trying to think and write about how to find joy in that world.
