import React from 'react'
import { Link } from 'gatsby'
import './layout.css'

import { rhythm } from '../utils/typography'

class Layout extends React.Component {
  render() {
    const { title, children } = this.props
    let header = (
      <nav className='flex justify-between font-sans text-sm tracking-widest'>
        <Link to='/' className='text-lg font-black tracking-normal'>
          {title}
        </Link>
        <ul className='list-reset'>
          <Link
            className='uppercase no-underline mx-4 hover:font-bold hover:text-green-800'
            to={'/blog'}
          >
            Blog
          </Link>
          <a
            className='uppercase no-underline mx-4 hover:font-bold hover:text-green-800'
            target='_blank'
            rel='noopener noreferrer'
            href='https://github.com/michaelhelvey'
          >
            Code
          </a>
        </ul>
      </nav>
    )
    return (
      <>
        <div className='flex flex-1 flex-col h-screen w-full pt-8'>
          <header className='container mx-auto px-4'>{header}</header>
          <main className='flex flex-1'>{children}</main>
          <div className='bg-gray-100 w-full'>
            <footer className='container mx-auto flex items-center font-sans bg-gray-100 text-xs text-gray-700 tracking-wide py-6 px-4'>
              Copyright 2019-present Michael Helvey. View the source on
              <a
                className='text-green-600 px-1'
                target='_blank'
                rel='noopener noreferrer'
                href='https://github.com/michaelhelvey/michaelhelvey.dev'
              >
                Github.
              </a>
              SDG.
            </footer>
          </div>
        </div>
      </>
    )
  }
}

export default Layout
