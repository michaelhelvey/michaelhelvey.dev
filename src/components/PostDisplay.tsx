import Link from "next/link"
import { Post } from "../lib/post"

type PostProps = { post: Post }

function PostDisplay({ post }: PostProps) {
	return (
		<article className="flex flex-col items-center font-serif">
			<span className="flex justify-center w-full my-6 md:my-16">
				<img alt="" src="post_separator.png" className="w-24"></img>
			</span>
			<h2 className="mb-4 text-base font-bold">
				<Link href={post.fileName}>
					<a className="hover:underline">{post.title}</a>
				</Link>
			</h2>
			<div
				className="text-black prose max-w-none leading-6"
				dangerouslySetInnerHTML={{ __html: post.body }}
			></div>
		</article>
	)
}

export default PostDisplay
