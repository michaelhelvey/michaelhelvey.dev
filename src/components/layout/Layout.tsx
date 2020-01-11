import React from 'react'
import '../../styles/global.css'

import SEO from './SEO'
import Navigation from './Navigation'
import Footer from './Footer'
import ThemeProvider from '../providers/ThemeProvider'

interface ILayoutProps {
  children: React.ReactNode
}
export default function Layout({ children }: ILayoutProps) {
  return (
    <div className="font-sans h-full">
      <ThemeProvider>
        <SEO />
        <div style={{ minHeight: '100%' }}>
          <header>
            <Navigation />
          </header>
          <main>{children}</main>
        </div>
        <Footer />
      </ThemeProvider>
    </div>
  )
}
