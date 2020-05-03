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
  id: string
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

async function parseRawContent(raw: string) {
  const parts = raw.split(/(-{3,})/g)
  const headParts = parts[2].split("\n").filter((p) => p !== "")
  const rawContent = parts[4]
  return {
    id: Math.random().toString(),
    frontmatter: parseHeadersToDict(headParts),
    content: { html: await parseMk(rawContent) },
  } as BlogPost
}

export default async function getPosts(): Promise<BlogPost[]> {
  return getAllPostsFiles().then((files) =>
    Promise.all(files.map((f) => getFileContent(f))).then((contentList) =>
      Promise.all(contentList.map((rawContent) => parseRawContent(rawContent)))
    )
  )
}
