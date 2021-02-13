import { GetStaticProps } from "next"
import PageContainer from "../components/PageContainer"
import PostDisplay from "../components/PostDisplay"
import { Post, PostData } from "../lib/post"

type HomePageProps = { posts: PostData[] }

function HomePage({ posts }: HomePageProps) {
	const allPosts = posts.map((post) => Post.fromJSON(post))
	return (
		<PageContainer pageName={null} pageDescription={null}>
			{allPosts.map((post) => (
				<PostDisplay post={post}></PostDisplay>
			))}
		</PageContainer>
	)
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
	const rendererModule = await import("../lib/renderer")
	const allPosts = await rendererModule.listAllPosts()
	return { props: { posts: allPosts.map((post) => post.toJSON()) } }
}

export default HomePage
