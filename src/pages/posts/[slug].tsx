import getPosts, { BlogPost } from "lib/blogPostBuilder"
import { GetStaticPaths } from "next"
import Layout from "components/Layout"
import { fmtDateFromString } from "lib/dateFormatter"

type PostDetailPageProps = {
  post: BlogPost
}

export default function PostDetailPage({ post }: PostDetailPageProps) {
  return (
    <Layout
      title={post.frontmatter.title}
      description={post.frontmatter.contentPreview}
    >
      <h1 className="font-bold text-gray-900 text-3xl mt-4">
        {post.frontmatter.title}
      </h1>
      <p className="italic text-gray-700 mt-2 text-sm">
        Posted {fmtDateFromString(post.frontmatter.date)}
      </p>
      <div
        className="bc mt-3"
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      ></div>
    </Layout>
  )
}

type GetPathResult<T> = T extends () => Promise<infer R> ? R : T
type SlugParams = { slug: string }
type SlugConfig = GetPathResult<GetStaticPaths<SlugParams>>

export async function getStaticPaths() {
  const posts = await getPosts()
  return posts.reduce<SlugConfig>(
    (result, post) => ({
      ...result,
      paths: [...result.paths, { params: { slug: post.slug } }],
    }),
    { paths: [], fallback: false }
  )
}

export async function getStaticProps({ params }: { params: SlugParams }) {
  const { slug } = params
  const allPosts = await getPosts()
  return {
    props: {
      post: allPosts.find((post) => post.slug === slug),
    },
  }
}
