// custom typefaces
import 'typeface-nunito-sans'
import 'typeface-merriweather'
import React from 'react'
import { BooksProvider } from './src/providers/books'

export const wrapRootElement = ({ element }) => (
  <BooksProvider>{element}</BooksProvider>
)
