import React from 'react'
import '../../styles/global.css'

import SEO from './SEO'
import Navigation from './Navigation'
import Footer from './Footer'
import ThemeProvider, { useTheme, TAS } from '../providers/ThemeProvider'

interface ILayoutProps {
  children: React.ReactNode
}
export default function Layout({ children }: ILayoutProps) {
  const theme = useTheme()
  return (
    <div className="font-sans h-full">
      <div
        style={{ minHeight: '100%', paddingBottom: '50px' }}
        className={TAS(theme, {
          baseStyles: '',
          light: 'bg-white',
          dark: 'bg-gray-900',
        })}
      >
        <header>
          <Navigation />
        </header>
        <main className="h-full">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
