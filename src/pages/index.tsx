import React from 'react'
import Layout from '../components/layout/Layout'
import PageWidthContainer from '../components/layout/PageWidthContainer'
import Blog from '../components/Blog'
import SEO from '../components/layout/SEO'

export default function HomePage() {
  return (
    <Layout>
      <SEO />
      <Blog />
    </Layout>
  )
}
