import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

interface ISEOQueryResult {
  site: {
    siteMetadata: {
      title: string
      description: string
      siteUrl: string
    }
  }
  ogImage: {
    childImageSharp: {
      resize: {
        src: string
      }
    }
  }
}

export default function SEO({
  path,
  description,
  title,
}: {
  path?: string
  description?: string
  title?: string
}) {
  const data = useStaticQuery<ISEOQueryResult>(graphql`
    query SEOQuery {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
      ogImage: file(relativePath: { eq: "cathedral.jpg" }) {
        childImageSharp {
          resize(width: 1024) {
            src
          }
        }
      }
    }
  `)
  const seo = data.site.siteMetadata
  const ogImage = data.ogImage.childImageSharp.resize.src
  return (
    <>
      <Helmet>
        <html lang="en"></html>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} key="description" />
        <meta
          name="twitter:description"
          content={seo.description}
          key="twitter:description"
        />
        <meta
          name="og:description"
          content={seo.description}
          key="og:description"
        />
        <meta name="og:image" content={seo.siteUrl + ogImage} key="og:image" />
        <meta name="og:title" content={seo.title} key="og:title" />
        <meta name="og:url" content={seo.siteUrl + (path ?? '/')} />
      </Helmet>
    </>
  )
}
