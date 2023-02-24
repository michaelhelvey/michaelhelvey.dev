/// <reference types="@astrojs/image/client" />

interface Frontmatter {
	title: string
	subtitle?: string
	date: string
	summary: string
	draft?: boolean
	readingTime: {
		text: string
		minutes: number
		time: number
		words: number
	}
}
