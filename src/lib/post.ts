export type PostData = {
	fileName: string
	title: string
	body: string
	excerpt: string
	timestamp: string
}

export class Post {
	public readonly fileName: string
	public readonly title: string
	public readonly body: string
	public readonly excerpt: string
	public readonly timestamp: Date

	constructor(
		fileName: string,
		title: string,
		body: string,
		excerpt: string,
		createdAt: Date
	) {
		this.fileName = fileName
		this.title = title
		this.body = body
		this.excerpt = excerpt
		this.timestamp = createdAt
	}

	public static fromJSON(postJSON: PostData) {
		return new Post(
			postJSON.fileName,
			postJSON.title,
			postJSON.body,
			postJSON.excerpt,
			new Date(postJSON.timestamp)
		)
	}

	public toJSON(): PostData {
		return {
			fileName: this.fileName,
			title: this.title,
			body: this.body,
			excerpt: this.excerpt,
			timestamp: this.timestamp.toISOString(),
		}
	}
}
