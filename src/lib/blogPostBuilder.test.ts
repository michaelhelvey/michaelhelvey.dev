import { _private } from "./blogPostBuilder"

const { getHeaderLines, parseHeadersToDict } = _private

describe("getHeaderLines", () => {
  test("one line per header", () => {
    const rawContent = `
    key: some value one line long
    nextKey: simple value
    `
    expect(getHeaderLines(rawContent)).toEqual([
      "key: some value one line long",
      "nextKey: simple value",
    ])
  })

  test("header spanning multiple lines", () => {
    const rawContent = `
    key: some long value that extends
    over multiple lines
    nextKey: simple value
    `
    expect(getHeaderLines(rawContent)).toEqual([
      "key: some long value that extends over multiple lines",
      "nextKey: simple value",
    ])
  })
})

describe("parseHeadersToDict", () => {
  test("when the header do not have special characters", () => {
    const rawLines = ["key: some value", "nextKey: another value"]

    expect(parseHeadersToDict(rawLines)).toMatchObject({
      key: "some value",
      nextKey: "another value",
    })
  })

  test("when the header contains special characters like :", () => {
    const rawLines = [
      "key: Understanding Academic Writing: A Study in 'Awfulness'",
    ]

    expect(parseHeadersToDict(rawLines)).toMatchObject({
      key: "Understanding Academic Writing: A Study in 'Awfulness'",
    })
  })
})
