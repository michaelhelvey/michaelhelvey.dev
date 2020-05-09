import getPosts, { BlogPost } from "lib/blogPostBuilder"
import BlogPostsList from "components/BlogPostsList"
import Layout from "components/Layout"

interface HomePageProps {
  posts: BlogPost[]
}

const Home = ({ posts }: HomePageProps) => (
  <Layout>
    <BlogPostsList posts={posts} />
  </Layout>
)

export async function getStaticProps(): Promise<{ props: HomePageProps }> {
  return { props: { posts: await getPosts() } }
}

export default Home
