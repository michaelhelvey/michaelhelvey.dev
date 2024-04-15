import prefetch from "@astrojs/prefetch"
import tailwind from "@astrojs/tailwind"
import vercel from "@astrojs/vercel/serverless"
import icon from "astro-icon"
import { defineConfig } from "astro/config"
import getReadingTime from "reading-time"
import { toString } from "./plugins/mdast-util-to-string"
import githubDarkTheme from "./src/styles/github_dark.json"

function remarkReadingTime() {
	return (tree, { data }) => {
		const textOnPage = toString(tree)
		const readingTime = getReadingTime(textOnPage)
		const maxSummary = 300
		const summaryText =
			textOnPage.length > maxSummary ? textOnPage.slice(0, maxSummary) + "..." : textOnPage
		data.astro.frontmatter.readingTime = readingTime
		data.astro.frontmatter.summary = summaryText
	}
}

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), prefetch(), icon()],
	vite: {
		ssr: {
			external: ["svgo"],
		},
	},
	markdown: {
		shikiConfig: {
			theme: githubDarkTheme,
		},
		remarkPlugins: [remarkReadingTime],
	},
	output: "server",
	adapter: vercel(),
})
