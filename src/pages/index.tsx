import SEO from "components/SEO"
import Navigation from "components/Navigation"
import Footer from "components/Footer"
import getPosts, { BlogPost } from "lib/blogPostBuilder"
import BlogPostsList from "components/BlogPostsList"

interface HomePageProps {
  posts: BlogPost[]
}

const Home = ({ posts }: HomePageProps) => (
  <div className="flex flex-col h-full">
    <header>
      <SEO />
      <Navigation />
    </header>
    <div className="flex flex-col items-center flex-1">
      <main className="flex-1 w-full max-w-2xl p-4">
        <BlogPostsList posts={posts} />
      </main>
    </div>
    <footer>
      <Footer />
    </footer>
  </div>
)

export async function getStaticProps(): Promise<{ props: HomePageProps }> {
  return { props: { posts: await getPosts() } }
}

export default Home
