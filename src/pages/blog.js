import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { rhythm } from '../utils/typography'

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title='' />
        <div className='md:pt-12 pt-6 font-sans container mx-auto px-4 flex flex-col items-center'>
          <div className='md:w-1/2 w-full'>
            {posts.map(({ node }) => {
              const title = node.frontmatter.title || node.fields.slug
              return (
                <div key={node.fields.slug} className='py-4'>
                  <h3>
                    <Link
                      className='text-xl font-black leading-normal text-green-700 font-sans'
                      to={node.fields.slug}
                    >
                      {title}
                    </Link>
                  </h3>
                  <div className='uppercase text-gray-600 font-bold text-sm'>
                    {node.frontmatter.date}
                  </div>
                  <p
                    className='py-3 font-serif leading-normal text-lg'
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`
