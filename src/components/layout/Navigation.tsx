import React, { useState } from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PageWidthContainer from './PageWidthContainer'
import { useTheme, TAS } from '../providers/ThemeProvider'
import ThemeSwitcher from '../ThemeSwitcher'

export default function Navigation() {
  interface IImageQuery {
    file: {
      childImageSharp: {
        fixed: any // let gatsby image take it from here
      }
    }
  }
  const imageData = useStaticQuery<IImageQuery>(graphql`
    query HeaderImageQuery {
      file(relativePath: { eq: "gopher.jpg" }) {
        childImageSharp {
          fixed(width: 40, height: 40) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)

  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setOpen(!open)
  }
  return (
    <nav
      className={TAS(theme, {
        baseStyles: 'w-full shadow',
        light: 'bg-white border-gray-400 text-gray-800',
        dark: 'bg-gray-900 text-white border-gray-100',
      })}
    >
      <PageWidthContainer>
        <div className="py-4 flex justify-between items-center">
          <Link
            aria-label="home"
            to="/"
            className="flex font-black ml-4 items-center"
          >
            <Img
              fixed={imageData.file.childImageSharp.fixed}
              className="rounded-full border border-gray-300"
            />
            <span className="ml-4 hidden md:flex">michaelhelvey.dev</span>
          </Link>
          <ThemeSwitcher />
          <DesktopMenu />
          <MobileMenuButton toggleOpen={toggleOpen} open={open} />
        </div>
        <div className={`py-4 px-6 flex flex-col ${!open ? 'hidden' : ''}`}>
          <Link
            to="/about/"
            className={TAS(theme, {
              baseStyles: 'text-sm uppercase font-sans font-bold my-1',
              light: 'text-blue-800',
              dark: 'text-blue-200',
            })}
          >
            About
          </Link>
          <Link
            to="/reading/"
            className={TAS(theme, {
              baseStyles: 'text-sm uppercase font-sans font-bold my-1',
              light: 'text-blue-800',
              dark: 'text-blue-200',
            })}
          >
            Current Reading
          </Link>
        </div>
      </PageWidthContainer>
    </nav>
  )
}

function MobileMenuButton({
  toggleOpen,
  open,
}: {
  toggleOpen: () => void
  open: boolean
}) {
  const theme = useTheme()
  return (
    <div className="flex lg:hidden flex-col">
      <button
        onClick={toggleOpen}
        className="focus:outline-none"
        aria-label={open ? 'close menu' : 'open menu'}
      >
        {open ? (
          <FontAwesomeIcon
            icon="times"
            className={TAS(theme, {
              baseStyles: 'w-5 h-5',
              light: 'text-black',
              dark: 'text-white',
            })}
          />
        ) : (
          <FontAwesomeIcon
            icon="bars"
            className={TAS(theme, {
              baseStyles: 'w-5 h-5',
              light: 'text-black',
              dark: 'text-white',
            })}
          />
        )}
      </button>
    </div>
  )
}

function DesktopMenu() {
  return (
    <div className="hidden lg:flex items-center">
      <ul>
        <li>
          <Link
            to="/about/"
            className="text-xs mx-3 uppercase font-black tracking-wide"
          >
            About
          </Link>
          <Link
            to="/reading/"
            className="text-xs mx-3 uppercase font-black tracking-wide"
          >
            Current Reading
          </Link>
        </li>
      </ul>
    </div>
  )
}
