/**
 * Utility functions for fetching lists of markdown posts and rendering them to HTML.
 */

import * as fs from "fs"
import * as path from "path"
import marked from "marked"
import { Post } from "./post"

const CONTENT_DIR = path.resolve(process.env.ROOT!, "content", "posts")
const PAGES_DIR = path.resolve(process.env.ROOT!, "content", "pages")

type FilePath = fs.PathLike
type FileName = string

export async function listAllPosts(): Promise<Post[]> {
	const fileNames = await listPostsDir()
	const posts: Post[] = []
	for (const fileName of fileNames) {
		posts.push(await postFromFileName(fileName))
	}

	return posts
}

export async function postFromFileName(fileName: FileName) {
	const fullFilePath = path.join(CONTENT_DIR, fileName)
	const stats = await getFileStats(fullFilePath)
	return postFromFileStats(stats, fullFilePath, fileName)
}

export async function pageFromFileName(fileName: FileName) {
	const fullFilePath = path.join(PAGES_DIR, fileName)
	const stats = await getFileStats(fullFilePath)
	return postFromFileStats(stats, fullFilePath, fileName)
}

export async function listPostsDir(): Promise<FileName[]> {
	return new Promise((resolve, reject) => {
		fs.readdir(CONTENT_DIR, { withFileTypes: true }, (error, files) => {
			if (error) {
				reject(error)
			}
			const realFiles = files.filter((f) => f.isFile()).map((f) => f.name)
			realFiles.sort((a, b) => {
				const aNum = Number(a.split("_")[0])
				const bNum = Number(b.split("_")[0])
				return aNum > bNum ? -1 : 1
			})
			resolve(realFiles)
		})
	})
}

async function postFromFileStats(
	stats: fs.Stats,
	filePath: FilePath,
	fileName: FileName
) {
	const createdAt = new Date(stats.birthtime)
	const rawBody = await readFileBody(filePath)
	const title = parseTitle(rawBody)
	const parsedBody = parseBody(rawBody)
	const body = marked(parsedBody)
	const excerpt = getPostExcerpt(parsedBody)
	return new Post(fileName, title, body, excerpt, createdAt)
}

async function getFileStats(filePath: FilePath): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filePath, (error, stats) => {
			if (error) {
				reject(error)
			}

			resolve(stats)
		})
	})
}

async function readFileBody(filePath: FilePath): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (error, data: Buffer) => {
			if (error) {
				reject(error)
			}

			resolve(data)
		})
	})
}

function parseTitle(fileBody: Buffer): string {
	const firstLine = []
	for (const charCode of fileBody) {
		const char = String.fromCharCode(charCode)
		if (["#"].includes(char)) {
			continue
		}
		if (char === "\n") {
			break
		}
		firstLine.push(char)
	}

	return firstLine.join("").trim()
}

function parseBody(fileBody: Buffer): string {
	let str = fileBody.toString("utf-8")
	return str.replace(new RegExp(/.*\n\n/), "")
}

const MAX_EXCERPT_LEN = 100
function getPostExcerpt(parsedBody: string): string {
	let str = parsedBody.replace(new RegExp(/\n/g), " ")
	str = str.replace(new RegExp(/# /g), "")
	str = str.slice(0, MAX_EXCERPT_LEN) + "..."
	return str
}
