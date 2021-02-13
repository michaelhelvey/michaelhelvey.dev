import Head from "next/head"
import SiteConfig from "../config"
import { SEOProps } from "./PageContainer"

function SEO({ pageName, pageDescription }: SEOProps) {
	const renderedName =
		pageName !== null ? `${pageName} - ${SiteConfig.name}` : SiteConfig.name
	const renderedDescription =
		pageDescription !== null ? pageDescription : SiteConfig.description
	return (
		<Head>
			<title>{renderedName}</title>
			<meta
				name="viewport"
				content="initial-scale=1.0, width=device-width"
			/>
			<link rel="icon" href="/favicon.ico" />
			<meta name="og:title" content={renderedName} />
			<meta name="og:description" content={renderedDescription} />
			<meta name="og:image" content="/background_image.jpg" />
		</Head>
	)
}

export default SEO
