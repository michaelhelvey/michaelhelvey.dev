import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  route?: string;
}

const defaultTitle = "michaelhelvey.dev";
const defaultDescription = "Christian, software developer, life-long student.";
const defaultImage = "/bg.jpg";
const defaultRoute = "/";

export default function SEO({ title, description, image, route }: SEOProps) {
  const _title = title ?? defaultTitle;
  const _description = description ?? defaultDescription;
  const _image = image ?? defaultImage;
  const _route = route ?? defaultRoute;

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
    </Head>
  );
}
