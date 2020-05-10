/**
 * Generates blog posts JSON from a directory of markdown files.
 */

import * as util from "util"
import * as fs from "fs"
import * as path from "path"
import commonmark from "commonmark"

const readFile = util.promisify(fs.readFile)
const listAllFiles = util.promisify(fs.readdir)
const baseContentDir = path.join(process.cwd(), "src", "content")
const basePostsDir = path.join(baseContentDir, "posts")

function parseMk(input: string) {
  const reader = new commonmark.Parser({ smart: true })
  const writer = new commonmark.HtmlRenderer()

  const parsed = reader.parse(input)
  return writer.render(parsed)
}

export interface BlogPost {
  slug: string
  frontmatter: {
    title?: string
    date?: string
    contentPreview?: string
  }
  content: {
    html: string
  }
}

async function getAllPostsFiles() {
  return listAllFiles(basePostsDir)
}

async function getFileContent(file: string) {
  const contentBuffer = await readFile(path.join(basePostsDir, file))
  return contentBuffer.toString("utf-8")
}

/**
 *  Some valid strings:
 *  'asdf'
 *  'asdf "1234"'
 *  "asdf 'asdf'"
 */
function parseToString(val: string) {
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.substr(1, val.length - 2)
  }

  if (val.startsWith('"') && val.endsWith('"')) {
    return val.substr(1, val.length - 2)
  }

  return val
}

/**
 * Parses raw header lines into a dictionary of header key:value pairs.
 * @param parts Array of header lines, unparsed.
 */
function parseHeadersToDict(parts: string[]) {
  return parts.reduce<{ [key: string]: string }>((acc, curr) => {
    // TODO: handle titles that have : in them
    const keyValueDelimeterSequence = ": "
    const halves = curr.split(keyValueDelimeterSequence)
    const key = halves[0]
    const value = parseToString(halves.slice(1).join(keyValueDelimeterSequence))
    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

function createContentPreview(rawContent: string, lengthChars: number = 240) {
  // strip markdown specific characters from the raw content string and return
  // `lengthChars` length.  `lengthCars` is not specific but instead gets as
  // close as it can get without splitting a word.

  const strippedContent = rawContent.replace(/#|_/g, "")
  const wordDelimiters = /\s|\t|\n/
  const ellipsis = "..."

  // TODO: research how javascript strings are implmented to understand the
  // performance implications of interating over a string in this way
  let i = 0
  let trimmedContent = ""
  for (const char of strippedContent.split("")) {
    if (i > lengthChars && char.match(wordDelimiters)) {
      // only break on word split
      break
    }
    trimmedContent += char
    i++
  }

  return trimmedContent.replace(/\n/g, " ").trim() + ellipsis
}

/**
 * Parses raw header content (sans delimiters) into individual header lines.
 * @param raw Raw string of content to parse.
 */
function getHeaderLines(raw: string) {
  const simpleLines = raw
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p !== "")

  // now some of these lines need to be combined, if they contain multi-line
  // values
  return simpleLines.reduce<string[]>((acc, curr, idx) => {
    if (idx === 0) {
      return [...acc, curr]
    }

    const hasKey = curr.match(/\w+:\s/)

    if (hasKey) {
      return [...acc, curr]
    }

    // the current line is not a key: value header, so it must be combined with
    // the previous line
    const previousLine = (acc[idx - 1] += ` ${curr}`)
    acc[idx - 1] = previousLine
    return acc
  }, [])
}

function parseRawContent(raw: string) {
  const parts = raw.split(/(-{3,})/g)
  const headParts = getHeaderLines(parts[2])
  const rawContent = parts[4]
  const headers = parseHeadersToDict(headParts)
  return {
    slug: headers.slug,
    frontmatter: {
      contentPreview: createContentPreview(rawContent),
      ...headers,
    },
    content: { html: parseMk(rawContent) },
  } as BlogPost
}

// all the posts are generated at build time, so this is just a build-time
// optimization to create an "in-memory database" of the results
let _cachedPosts: BlogPost[] | null = null

export default async function getPosts(): Promise<BlogPost[]> {
  if (_cachedPosts) {
    return _cachedPosts
  }

  const allPosts = await getAllPostsFiles().then((files) =>
    Promise.all(files.map((f) => getFileContent(f))).then((contentList) =>
      Promise.all(contentList.map((rawContent) => parseRawContent(rawContent)))
    )
  )

  _cachedPosts = allPosts.sort(
    (a, b) =>
      new Date(b.frontmatter.date || 0).getTime() -
      new Date(a.frontmatter.date || 0).getTime()
  )

  return _cachedPosts
}

export const _private = {
  getHeaderLines,
  parseHeadersToDict,
}
