import Link from "next/link"
type PostProps = { title: string }

function PostDisplay({ title }: PostProps) {
	return (
		<div className="flex flex-col items-center font-serif">
			<span className="flex justify-center w-full my-6 md:my-16">
				<img alt="" src="post_separator.png" className="w-24"></img>
			</span>
			<h2 className="mb-3 text-base font-bold">
				<Link href="#">
					<a className="hover:underline">{title}</a>
				</Link>
			</h2>
			<p className="py-2 leading-6">
				9.1 Again, one who pursues pleasure as good and tries to avoid
				pain as an evil is acting irreverently; for it is inevitable
				that such a person must often find fault with universal nature
				for assigning something to good people or bad which is contrary
				to their deserts, because it is so often the case that the bad
				devote themselves to pleasure and secure the things that give
				rise to it whilst the good encounter pain and what gives rise to
				that.
			</p>
		</div>
	)
}

export default PostDisplay
