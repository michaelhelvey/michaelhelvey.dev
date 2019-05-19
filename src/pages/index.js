import React from 'react'
import { Link } from 'gatsby'

// import Bio from "../components/bio"
import Layout from '../components/layout'
import SEO from '../components/seo'
// import { rhythm } from "../utils/typography"

export default class SiteIndex extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <SEO title='Home' />
        <div className='md:pt-32 pt-12 md:px-24 px-4 flex flex-col'>
          <h1 className='font-black text-5xl font-sans'>Michael Helvey</h1>
          <div className='font-sans text-gray-700 py-4 text-lg tracking-wide'>
            Developer, Writer, Christian, Student
          </div>
        </div>
        <div className='py-4 md:px-24 px-4 flex justify-between md:w-2/3 w-full font-sans leading-normal text-lg'>
          I love to learn and create new tools which allow those around me to
          create good things. I write about what I learn and build. I’m
          passionate about building systems that make the internet a better
          place for humans.
        </div>
      </Layout>
    )
  }
}
