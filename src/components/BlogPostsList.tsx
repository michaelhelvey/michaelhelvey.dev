import BlogPostPreview from "./BlogPostPreview"
import type { BlogPost } from "lib/blogPostBuilder"

interface BlogPostListProps {
  posts: BlogPost[]
}

export default function BlogPostsList({ posts }: BlogPostListProps) {
  return (
    <>
      {posts.map((post) => (
        <BlogPostPreview post={post} key={post.id} />
      ))}
    </>
  )
}
