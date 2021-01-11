import { GetStaticProps } from "next"
import { ParsedUrlQuery } from "querystring"
import PageContainer from "../components/PageContainer"
import PostDisplay from "../components/PostDisplay"
import { PostData, Post } from "../lib/post"

type PageDisplayProps = { postData: PostData }

function PageDisplay({ postData }: PageDisplayProps) {
	const post = Post.fromJSON(postData)
	return (
		<PageContainer pageName={post.title} pageDescription={post.excerpt}>
			<PostDisplay post={post} />
		</PageContainer>
	)
}

export const getStaticProps: GetStaticProps<
	PageDisplayProps,
	ParsedUrlQuery
> = async (context) => {
	if (!context.params?.page) {
		return { notFound: true }
	}
	if (typeof context.params.page !== "string") {
		return { notFound: true }
	}

	const rendererModule = await import("../lib/renderer")
	const post = await rendererModule.pageFromFileName(
		context.params.page + ".md"
	)
	const props = { postData: post.toJSON() }
	return { props }
}

export async function getStaticPaths() {
	return {
		paths: [
			{ params: { page: "about" } },
			{ params: { page: "current-reading" } },
		],
		fallback: false,
	}
}

export default PageDisplay
