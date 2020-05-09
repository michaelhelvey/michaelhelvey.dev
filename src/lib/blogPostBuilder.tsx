/**
 * Generates blog posts JSON from a list of markdown files.
 */

import * as util from "util"
import * as fs from "fs"
import * as path from "path"
import marked from "marked"

const readFile = util.promisify(fs.readFile)
const parseMk = util.promisify(marked.parse)
const listAllFiles = util.promisify(fs.readdir)
const baseContentDir = path.join(process.cwd(), "src", "content")
const basePostsDir = path.join(baseContentDir, "posts")

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

function parseHeadersToDict(parts: string[]) {
  return parts.reduce<{ [key: string]: string }>((acc, curr) => {
    const halves = curr.split(": ")
    return {
      ...acc,
      [halves[0]]: halves[1],
    }
  }, {})
}

function createContentPreview(rawContent: string, lengthChars: number = 240) {
  // strip markdown specific characters from the raw content string and return
  // `lengthChars` length.  `lengthCars` is not specific but instead gets as
  // close as it can get without splitting a word.

  const strippedContent = rawContent.replace(/#/g, "")
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

  return trimmedContent + ellipsis
}

async function parseRawContent(raw: string) {
  const parts = raw.split(/(-{3,})/g)
  const headParts = parts[2].split("\n").filter((p) => p !== "")
  const rawContent = parts[4]
  const headers = parseHeadersToDict(headParts)
  return {
    slug: headers.slug,
    frontmatter: {
      contentPreview: createContentPreview(rawContent),
      ...headers,
    },
    content: { html: await parseMk(rawContent) },
  } as BlogPost
}

export default async function getPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPostsFiles().then((files) =>
    Promise.all(files.map((f) => getFileContent(f))).then((contentList) =>
      Promise.all(contentList.map((rawContent) => parseRawContent(rawContent)))
    )
  )

  return allPosts.sort(
    (a, b) =>
      new Date(b.frontmatter.date || 0).getTime() -
      new Date(a.frontmatter.date || 0).getTime()
  )
}
