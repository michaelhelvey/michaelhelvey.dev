import BlogPostPreview from "./BlogPostPreview"
import type { BlogPost } from "lib/blogPostBuilder"

interface BlogPostListProps {
  posts: BlogPost[]
}

export default function BlogPostsList({ posts }: BlogPostListProps) {
  return (
    <>
      {posts.map((post) => (
        <div className="mb-12" key={`posts-${post.slug}`}>
          <BlogPostPreview post={post} />
        </div>
      ))}
    </>
  )
}
