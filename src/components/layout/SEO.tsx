import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

interface ISEOQueryResult {
  site: {
    siteMetadata: {
      title: string
      description: string
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

export default function SEO() {
  const data = useStaticQuery<ISEOQueryResult>(graphql`
    query SEOQuery {
      site {
        siteMetadata {
          title
          description
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
      <Helmet title={seo.title}>
        <html lang="en"></html>
        <meta name="description" content={seo.description} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="og:description" content={seo.description} />
        <meta name="og:image" content={ogImage} />
      </Helmet>
    </>
  )
}
