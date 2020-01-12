/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react'
import ThemeProvider from './src/components/providers/ThemeProvider'

export const wrapPageElement = ({ element, props }) => {
  return <ThemeProvider>{element}</ThemeProvider>
}
