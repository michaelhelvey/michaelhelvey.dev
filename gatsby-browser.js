/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import React from 'react'
import ReactDOM from 'react-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes,
  faBars,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import ThemeProvider from './src/components/providers/ThemeProvider'

export const onInitialClientRender = async (_, pluginOptions = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    const { default: axe } = await import('react-axe')
    axe(React, ReactDOM, 1000, { showInProduction: false })
  }
}

export const onClientEntry = async (_, pluginOptions = {}) => {
  library.add(faTimes, faBars, faMoon, faSun)
}

export const wrapPageElement = ({ element, props }) => {
  return <ThemeProvider>{element}</ThemeProvider>
}
