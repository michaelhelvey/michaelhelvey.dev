import type { BlogPost } from "lib/blogPostBuilder"

interface BlogPostPreviewProps {
  post: BlogPost
}

export default function BlogPostPreview({ post }: BlogPostPreviewProps) {
  return (
    <div className="flex flex-col my-4">
      <p>{post.id}</p>
      <p>{post.frontmatter.title}</p>
      <p>{post.frontmatter.contentPreview}</p>
      <p>{post.frontmatter.date}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content.html }}></div>
    </div>
  )
}
