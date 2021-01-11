import Link from "next/link"
import SEO from "./SEO"
import SiteConfig from "../config"
import MobileMenu from "../components/MobileMenu"

export type PageProps = {
	pageName: string | null
	pageDescription: string | null
	children: React.ReactNode
}

export type SEOProps = Omit<PageProps, "children">

const DesktopMenu = () => (
	<div className="items-center justify-center hidden w-full mt-6 text-base space-x-5 md:flex">
		{SiteConfig.menuLinks.map((link) => (
			<Link href={link.href} key={`menu-link-${link.title}`}>
				<a className="hover:underline">{link.title}</a>
			</Link>
		))}
	</div>
)

export default function PageContainer({
	children,
	pageName,
	pageDescription,
}: PageProps) {
	return (
		<div className="flex flex-col items-center w-full min-h-screen">
			<SEO pageName={pageName} pageDescription={pageDescription} />
			<header className="w-full max-w-3xl font-serif">
				<DesktopMenu />
				<MobileMenu />
				<div className="flex flex-col items-center justify-center mt-10">
					<h1 className="text-2xl font-bold">
						<Link href="/">
							<a className="hover:underline">{SiteConfig.name}</a>
						</Link>
					</h1>
					<p className="mt-4 text-base">{SiteConfig.description}</p>
				</div>
			</header>
			<main className="flex-1 w-full max-w-xl px-4 mt-4 font-serif text-base">
				{children}
			</main>
			<footer className="flex flex-col items-center mb-6 font-serif">
				<span className="flex justify-center w-full my-6 md:my-16">
					<img alt="" src="post_separator.png" className="w-24"></img>
				</span>
				<p>&copy; 2021 Michael Helvey</p>
				<a
					href="https://github.com/michaelhelvey/michaelhelvey.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="italic text-blue-700 underline"
				>
					See the code
				</a>
			</footer>
		</div>
	)
}
