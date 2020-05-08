import type { BlogPost } from "lib/blogPostBuilder"

interface BlogPostPreviewProps {
  post: BlogPost
}

export default function BlogPostPreview({ post }: BlogPostPreviewProps) {
  const dateFmt = post.frontmatter.date
    ? new Date(post.frontmatter.date).toLocaleString()
    : ""
  return (
    <div className="flex flex-col my-4 py-6">
      <div className="font-bold text-gray-800 text-2xl">
        {post.frontmatter.title}
      </div>
      <p className="italic text-gray-600 mt-2 text-sm">Posted {dateFmt}</p>
      <p className="mt-4 text-gray-800 leading-normal">
        {post.frontmatter.contentPreview}
      </p>
    </div>
  )
}
