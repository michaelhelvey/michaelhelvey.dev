import React from 'react'
import { Link } from 'gatsby'
import './layout.css'

import { rhythm } from '../utils/typography'

class Layout extends React.Component {
  render() {
    const { title, children } = this.props
    let header = (
      <nav className='flex justify-between font-sans text-sm tracking-wide'>
        <Link to='/' className='text-base font-black'>
          {title}
        </Link>
        <ul className='list-reset'>
          <Link className='uppercase no-underline mx-4' to={'/blog'}>
            Blog
          </Link>
          <a
            className='uppercase no-underline mx-4'
            href='https://github.com/michaelhelvey'
          >
            Code
          </a>
        </ul>
      </nav>
    )
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
          <main className='h-full'>{children}</main>
        </div>
        <footer
          className='flex items-center font-sans bg-gray-100 container px-8 text-xs text-gray-700 tracking-wide'
          style={{ height: '60px' }}
        >
          Copyright 2019-present Michael Helvey. View source on
          <a
            className='text-green-600 px-1'
            target='_blank'
            rel='noopener noreferrer'
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
