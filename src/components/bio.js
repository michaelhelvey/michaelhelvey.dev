/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from 'react'
import { StaticQuery, graphql, Link } from 'gatsby'
import SignUpForm from '../components/signUpForm'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author } = data.site.siteMetadata
        return (
          <div className='flex flex-col mt-4 mb-6 items-start rounded'>
            <SignUpForm />
            <div className='flex items-center mt-3'>
              <Image
                fixed={data.avatar.childImageSharp.fixed}
                alt={author}
                style={{
                  marginRight: '1rem',
                  marginBottom: 0,
                  minWidth: 20,
                  borderRadius: `100%`,
                }}
              />
              <p className='text-sm font-sans'>
                Just want to talk? Feel free to tweet{' '}
                <a
                  className='text-gray-600'
                  href='https://twitter.com/helvetici'
                >
                  @helvetici
                </a>
                .
              </p>
            </div>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 30, height: 30) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          twitter
        }
      }
    }
  }
`

export default Bio
