import React, { useState } from 'react'
import { useTheme, TAS } from './providers/ThemeProvider'
import { useStaticQuery, graphql, Link } from 'gatsby'
import PageWidthContainer from './layout/PageWidthContainer'

interface IBlogPostResults {
  allMarkdownRemark: {
    edges: [
      {
        node: {
          excerpt: string
          fields: {
            slug: string
          }
          frontmatter: {
            title: string
            tag: string[]
            date: string
          }
          html: string
        }
      }
    ]
  }
}

const blogListQuery = graphql`
  query blogListQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(pruneLength: 400)
          fields {
            slug
          }
          frontmatter {
            title
            date
            tags
          }
          html
        }
      }
    }
  }
`

export default function Blog() {
  const theme = useTheme()
  const [skip, setSkip] = useState(0)
  const data = useStaticQuery<IBlogPostResults>(blogListQuery)

  return (
    <div className="py-6">
      {data.allMarkdownRemark.edges.map(({ node: post }, index) => (
        <div key={`posts-${index}`}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}

function PostCard({
  post,
}: {
  post: IBlogPostResults['allMarkdownRemark']['edges']['0']['node']
}) {
  const date = new Date(post.frontmatter.date)
  const theme = useTheme()
  return (
    <div
      className={TAS(theme, {
        baseStyles: 'font-serif',
        light: 'text-gray-900',
        dark: 'text-gray-100',
      })}
    >
      <PageWidthContainer narrow>
        <h1 hidden>Blog</h1>
        <div className="py-6">
          <Link
            to={post.fields.slug}
            className={TAS(theme, {
              baseStyles: 'text-xl font-serif font-black',
              light: 'text-blue-800',
              dark: 'text-blue-200',
            })}
          >
            {post.frontmatter.title}
          </Link>
          <div
            className={TAS(theme, {
              baseStyles: 'text-base font-serif',
              light: 'text-gray-800',
              dark: 'text-gray-300',
            })}
          >
            {date ? date.toLocaleDateString() : null}
          </div>
          <div className="leading-relaxed mt-3">{post.excerpt}</div>
        </div>
      </PageWidthContainer>
    </div>
  )
}
