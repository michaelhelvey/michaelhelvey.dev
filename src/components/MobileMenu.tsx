import { useState, MouseEvent } from "react"
import Link from "next/link"
import SiteConfig from "../config"

function MobileMenu() {
	const [open, setOpen] = useState(false)

	const toggleOpen = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		setOpen(!open)
	}

	return (
		<div className="flex flex-col items-center justify-center w-full mt-6 text-base md:hidden">
			<button className="text-sm uppercase" onClick={toggleOpen}>
				Menu
			</button>
			<div className="flex flex-col items-center mt-4">
				{open
					? SiteConfig.menuLinks.map((link) => (
							<Link
								href={link.href}
								key={`menu-link-${link.title}`}
							>
								<a className="hover:underline">{link.title}</a>
							</Link>
					  ))
					: null}
			</div>
		</div>
	)
}

export default MobileMenu
