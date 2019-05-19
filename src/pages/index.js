import React from 'react'
import { Link, graphql } from 'gatsby'

// import Bio from "../components/bio"
import Layout from '../components/layout'
import SEO from '../components/seo'
// import { rhythm } from "../utils/typography"

export default class SiteIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="Home" />
        <Link to={'/blog'}>Blog</Link>
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
