import type { BlogPost } from "lib/blogPostBuilder"
import Link from "next/link"
import { fmtDateFromString } from "lib/dateFormatter"

interface BlogPostPreviewProps {
  post: BlogPost
}

export default function BlogPostPreview({ post }: BlogPostPreviewProps) {
  return (
    <article className="flex flex-col my-4">
      <Link href={`/posts/${post.slug}`}>
        <a className="font-bold text-gray-800 text-2xl hover:text-primary">
          <h1>{post.frontmatter.title}</h1>
        </a>
      </Link>
      <p className="italic text-gray-700 mt-2 text-sm">
        Posted {fmtDateFromString(post.frontmatter.date)}
      </p>
      <p className="mt-4 text-gray-900 leading-normal font-serif">
        {post.frontmatter.contentPreview}
      </p>
    </article>
  )
}
