import React from 'react'
import Layout from '../components/layout/Layout'
import PageWidthContainer from '../components/layout/PageWidthContainer'

export default function HomePage() {
  return (
    <Layout>
      <PageWidthContainer narrow>
        <h1 hidden>Blog</h1>
        <div className="py-3 font-serif">blog posts</div>
      </PageWidthContainer>
    </Layout>
  )
}
