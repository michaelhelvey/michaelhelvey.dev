import React from 'react'
import Layout from './layout/Layout'
import PageWidthContainer from './layout/PageWidthContainer'
import SEO from './layout/SEO'
import '../styles/blog-post.css'
import { TAS, useTheme } from './providers/ThemeProvider'

interface IBlogPost {
  excerpt: string
  frontmatter: {
    title: string
    date: string
    tags?: string[]
  }
  html: string
}

interface IBlogPostProps {
  location: { href: string }
  pageContext: {
    post: { node: IBlogPost }
    previous: IBlogPost
    next: IBlogPost
  }
}
export default function BlogPost(props: IBlogPostProps) {
  const post = props.pageContext.post.node
  return (
    <Layout>
      <SEO
        location={props.location.href}
        title={post.frontmatter.title}
        description={post.excerpt}
      />
      <BlogPostItem post={post} />
    </Layout>
  )
}

function BlogPostItem({ post }: { post: IBlogPost }) {
  const theme = useTheme()
  const date = new Date(post.frontmatter.date)
  return (
    <div
      className={TAS(theme, {
        baseStyles: 'font-serif',
        light: 'text-gray-900',
        dark: 'text-gray-300',
      })}
    >
      <PageWidthContainer narrow>
        <div className="py-6">
          <h1
            className={TAS(theme, {
              baseStyles: 'font-bold text-3xl',
              light: 'text-blue-800',
              dark: 'text-blue-200',
            })}
          >
            {post.frontmatter.title}
          </h1>
          <div className={'mt-2'}>
            Posted {date ? date.toLocaleDateString() : null}
          </div>
          <div className="mt-2" hidden={!post.frontmatter.tags}>
            Tagged with{' '}
            <span className="font-bold">
              {post.frontmatter.tags?.join(', ')}
            </span>
          </div>
          <hr className="my-4" />
          <div
            dangerouslySetInnerHTML={{ __html: post.html }}
            className="blogPost text-base leading-relaxed"
          ></div>
        </div>
      </PageWidthContainer>
    </div>
  )
}
