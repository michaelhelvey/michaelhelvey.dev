import React from 'react'
import { Link } from 'gatsby'
import './layout.css'

class Layout extends React.Component {
  render() {
    const { title, children } = this.props
    let header = (
      <nav className='flex justify-between font-sans md:text-sm text-xs tracking-widest'>
        <Link to='/' className='sm:text-lg text-sm font-black tracking-normal'>
          {title}
        </Link>
        <ul className='list-reset flex items-center pr-3'>
          <Link
            className='uppercase no-underline sm:mx-4 mx-2 hover:font-bold hover:text-green-800'
            to={'/blog'}
          >
            Blog
          </Link>
          <Link
            className='uppercase no-underline sm:mx-4 mx-2 hover:font-bold hover:text-green-800'
            to={'/reading'}
          >
            Reading
          </Link>
          <a
            className='uppercase no-underline sm:mx-4 mx-2 hover:font-bold hover:text-green-800'
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
          <div className='bg-gray-100'>
            <footer className='container mx-auto flex items-center font-sans bg-gray-100 text-xs text-gray-700 tracking-wide py-6 px-4'>
              Copyright 2019-present Michael Helvey.
              <a
                className='text-green-600 px-1'
                target='_blank'
                rel='noopener noreferrer'
                href='https://github.com/michaelhelvey/michaelhelvey.dev'
              >
                See the code.
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
