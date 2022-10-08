---
layout: ../../layouts/PostLayout.astro
title: "Testing Node.js APIs with Microtest"
subtitle: "Microtest 2.0 is a utility library for integration testing Node.js applications"
date: "September 10, 2022"
---

[Microtest](https://github.com/michaelhelvey/microtest/) was born from the
desire to test my Node.js APIs the same way that they would be consumed by
clients: by making real HTTP requests to a real server. I believe that tests are
most effective when they most closely resemble the way the software will
ultimately be used, and for an API, that means over HTTP.

At the same time, however, I wanted to still be able to use the tooling (such as
module mocking, spies, coverage, or lifecycle hooks) from the test runner (such
as [jest](https://jestjs.io) or [vitest](https://vitest.dev)) that the rest of
my tests used.

In this blog post, I want to briefly introduce Microtest's API, and show you how you can use it to write better integration tests for your Node.js APIs.

To get started, install Microtest using your javascript package manager of choice. For this this example, I'll use `pnpm`.

```shell
$ pnpm add -D @michaelhelvey/microtest
```

Now let's imagine that we have a simple API, written with the
[express](https://expressjs.com) framework:

```ts
// app.ts
import express from "express"

export const app = express()

app.get("/", (req, res) => {
	res.status(200).send({ message: `Hello, ${req.query.name}!` })
})
```

Here's how we would test this with Microtest: first, we need to use the
lifecycle hooks our test runner provides to start our server. Microtest itself
is completely unopinionated about how your application starts or stops. For
this example, I'll just start and stop the server, but in a real-world
application, we might already be doing other things in these lifecycle hooks,
like seeding mock data, mocking external APIs, or wrapping our database calls in
a transaction.

```ts
import { app } from "../app.ts"
import http from "node:http"

let server: http.Server

beforeAll(() => {
	return new Promise((resolve) => {
		server = app.listen(9999, resolve)
	})
})

afterAll(() => {
	server.close()
})
```

Once we've started our server, we can use the utility functions that microtest provides to make real HTTP requests to the server we just set up, parse the response, and make assertions:

```ts
const request = microtest("http://localhost:9999")

test("the API returns a hello world message", async () => {
	const response = await request((ctx) =>
		ctx
			.get("/")
			.query({ name: "Thomas" })
			.header("x-custom-header", "My Header")
	)
		.status(200)
		.json<{ message: string }>()

	expect(response.message).toEqual("Hello, Thomas!")
})
```

In this example the `get` function on `ctx` is being used to set the method and
the route, and then the `query` function is used to pass in an object that will
be serialized into the final request's query parameters. We also set a custom
header. Then once the response comes back we assert that the it has a status
code of 200 using the `status` function, and then both assert and parse the
final response as JSON using the `json` function, including the expected
Typescript response type as a type argument.

Microtest is highly customizable, allowing you to either change default
behavior, or drop down to the lower level libraries that power it, like `qs` or
`node-fetch`. For example:

```ts
const request = microtest("http://localhost:9999", {
	// We customize how query parameters will be parsed by creating our own parser function
	queryParser: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
})

test("customized example", async () => {
	const response = await request(
		(ctx) =>
			ctx
				.post("/")
				.query({ foo: "bar" })
				// Here we customize the options passed to the underlying
				// `fetch` API; in this case, by customizing the redirect
				// behavior
				.fetchOptions({ redirect: "error" })
				// Microtest natively supports JSON and FormData POST request
				// bodies.  To use a different content type, drop down to the
				// lower level `body` function and set the raw request body.
				// This could be, for example, a Node.js stream.
				.body(new CustomContent())
				.header("content-type", "x-custom-content-type")
		// Finally, skip automatic response parsing and get the raw response
		// object for the rest of your test
	).raw()
})
```

To learn more, visit the [full API documentation](https://michaelhelvey.github.io/microtest/), or get started by installing `@michaelhelvey/microtest` from NPM.
