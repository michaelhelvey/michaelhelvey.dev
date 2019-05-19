import React from 'react'
import { Link } from 'gatsby'
import './layout.css'

import { rhythm, scale } from '../utils/typography'

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname !== rootPath) {
      header = (
        <h1
          style={{
            ...scale(1.2),
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      // it IS the root path
      header = (
        <nav className='flex justify-between font-sans text-sm tracking-wide'>
          <a href='/' className='text-base font-black'>
            michaelhelvey.dev
          </a>
          <ul className='list-reset'>
            <Link className='uppercase no-underline mx-4' to={'/blog'}>
              Blog
            </Link>
            <Link className='uppercase no-underline mx-4' to={'/blog'}>
              Code
            </Link>
          </ul>
        </nav>
      )
    }
    return (
      <>
        <div
          className='container mx-auto flex flex-1 flex-col'
          style={{
            padding: `${rhythm(1.2)} ${rhythm(3 / 4)}`,
            flex: '1 0 auto',
            height: '100vh',
            marginBottom: '-60px',
          }}
        >
          <header>{header}</header>
          <main>{children}</main>
        </div>
        <footer
          className='sticky flex items-center font-sans bg-gray-100 py-4 px-8 text-xs text-gray-700 tracking-wide flex-shrink-0'
          style={{ height: '60px' }}
        >
          Copyright 2019-present Michael Helvey. View source on
          <a
            className='text-green-600 px-1'
            target='_blank'
            rel='noopen noreferrer'
            href='https://github.com/michaelhelvey/michaelhelvey.dev'
          >
            Github.
          </a>
        </footer>
      </>
    )
  }
}

export default Layout
