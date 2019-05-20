import React from 'react'

import Image from 'gatsby-image'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

export default class SiteIndex extends React.Component {
  render() {
    const { data } = this.props
    const { site, avatar } = data
    return (
      <Layout location={this.props.location} title={site.siteMetadata.title}>
        <SEO title='Home' />
        <div class='h-full flex flex-col justify-center container mx-auto'>
          <div className='md:px-24 px-4 flex flex-col justify-center'>
            <div className='flex items-center md:flex-row flex-col'>
              <Image
                fixed={avatar.childImageSharp.fixed}
                alt={'Michael Helvey'}
                className='rounded-full shadow-lg'
              />
              <h1 className='font-black md:text-5xl text-3xl font-sans px-4 py-3'>
                Michael Helvey
              </h1>
            </div>
            <div className='font-sans text-gray-700 py-4 text-lg tracking-wide md:text-left text-center'>
              Developer, Writer, Christian
            </div>
          </div>
          <div className='py-4 md:px-24 px-4 flex justify-between lg:w-2/3 w-full font-sans leading-normal text-lg'>
            I love to learn and create new tools which allow those around me to
            create good things. I write about what I learn. I’m passionate about
            building systems that make the internet a better place for humans.
          </div>
        </div>
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
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 80, height: 80) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
