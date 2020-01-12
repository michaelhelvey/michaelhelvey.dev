import React from 'react'
import PageWidthContainer from './PageWidthContainer'
import { TAS, useTheme } from '../providers/ThemeProvider'

export default function Footer() {
  const theme = useTheme()
  return (
    <footer
      className={TAS(theme, {
        baseStyles: 'flex justify-center',
        light: 'border-gray-300 bg-gray-100 text-gray-800',
        dark: 'bg-gray-800 border-gray-600 text-gray-100',
      })}
      style={{ height: '50px', marginTop: '-50px' }}
    >
      <PageWidthContainer>
        <div className="py-4 text-xs">
          Copyright &copy; 2020-present Michael Helvey.{' '}
          <span className="italic">SDG.</span>
        </div>
      </PageWidthContainer>
    </footer>
  )
}
