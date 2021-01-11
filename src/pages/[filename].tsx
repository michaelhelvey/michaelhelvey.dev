import { GetStaticProps } from "next"
import { ParsedUrlQuery } from "querystring"
import PageContainer from "../components/PageContainer"
import PostDisplay from "../components/PostDisplay"
import { PostData, Post } from "../lib/post"

type PostDetailPageProps = { postData: PostData }

function PostDetailPage({ postData }: PostDetailPageProps) {
	const post = Post.fromJSON(postData)
	return (
		<PageContainer pageName={post.title} pageDescription={post.excerpt}>
			<PostDisplay post={post} />
		</PageContainer>
	)
}

export const getStaticProps: GetStaticProps<
	PostDetailPageProps,
	ParsedUrlQuery
> = async (context) => {
	if (!context.params?.filename) {
		return { notFound: true }
	}
	if (typeof context.params.filename !== "string") {
		return { notFound: true }
	}

	const rendererModule = await import("../lib/renderer")
	const post = await rendererModule.postFromFileName(context.params.filename)
	const props = { postData: post.toJSON() }
	return { props }
}

export async function getStaticPaths() {
	const rendererModule = await import("../lib/renderer")
	const postFileNames = await rendererModule.listPostsDir()
	return {
		paths: postFileNames.map((filename) => ({
			params: {
				filename,
			},
		})),
		fallback: false,
	}
}

export default PostDetailPage
