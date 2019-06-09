import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { rhythm } from '../utils/typography'
import './theme.css'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <div className='flex flex-col justify-center items-center w-full px-3'>
          <div
            className='font-serif text-base py-6 px-4'
            style={{
              maxWidth: rhythm(24),
            }}
          >
            <h1 className='py-4 text-2xl text-green-700 font-black font-sans'>
              {post.frontmatter.title}
            </h1>
            <p className='font-black font-sans text-base text-gray-600'>
              {post.frontmatter.date}
            </p>
            <div
              className='py-4 tracking-normal blogPost text-sm'
              style={{ lineHeight: '1.75' }}
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <div className='border-b border-gray-300 flex-1 mb-6' />
            <Bio />
            <div className='border-b border-gray-300 flex-1 mb-6' />

            <ul
              style={{
                display: `flex`,
                flexWrap: `wrap`,
                justifyContent: `space-between`,
                listStyle: `none`,
                padding: 0,
              }}
            >
              <li>
                {previous && (
                  <Link
                    className='font-sans text-base'
                    to={previous.fields.slug}
                    rel='prev'
                  >
                    ← {previous.frontmatter.title}
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link
                    className='font-sans text-base'
                    to={next.fields.slug}
                    rel='next'
                  >
                    {next.frontmatter.title} →
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
