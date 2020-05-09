import Head from "next/head"

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  route?: string
}

const defaultTitle = "michaelhelvey.dev"
const defaultDescription = "Christian, software developer, life-long student."
const defaultImage = "/bg.jpg"
const defaultRoute = "/"

export default function SEO({ title, description, image, route }: SEOProps) {
  const _title = title ?? defaultTitle
  const _description = description ?? defaultDescription
  const _image = image ?? defaultImage
  const _route = route ?? defaultRoute

  return (
    <Head>
      <title>{_title}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="description" content={_description} key="description" />
      <meta name="og:description" content={_description} key="og:description" />
      <meta name="og:image" content={_image} key="og:image" />
      <meta name="og:title" content={_title} key="og:title" />
      <meta
        name="og:url"
        content={"https://michaelhelvey.dev" + _route}
        key="og:url"
      />
      <meta name="og:type" content="website" key="og:type" />
      <meta name="twitter:creator" content="@helvetici" key="twitter:creator" />
      link rel="manifest" href="manifest.json">
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="MH" />
      <meta name="apple-mobile-web-app-title" content="MH" />
      <meta name="theme-color" content="#276749" />
      <meta name="msapplication-navbutton-color" content="#276749" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="msapplication-starturl" content="/" />
    </Head>
  )
}
