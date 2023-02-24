---
layout: ../../layouts/PostLayout.astro
title: "Defining Software Complexity"
subtitle: "A personal manifesto on software quality"
draft: true
date: "Febuary 14, 2023"
---

As software engineers, we talk about complexity a lot. We talk about reducing
complexity, managing complexity, avoiding complexity, and so on. A common
justification for writing some new piece of software infrastructure is an
explanation of how "simple" writing code will be using this new library,
framework, or other tool.

"Using my new PDF layout library, creating a PDF will no longer requires this
_apparently bloated, awful, unreadable mess_, but instead only require this
_simple, declarative, YAML file_."

"Instead of creating new services _manually_, with this _complex spaghetti
system of bash scripts_, using this new _orchestrator_ you can just define
_containers_ with _YAML_ and it will _take care of the complexity for you._"

And so on.

Since avoiding complexity seems to be the goal of most code these days, I want
to try to define it.

Let's start by drawing some text to the screen.
