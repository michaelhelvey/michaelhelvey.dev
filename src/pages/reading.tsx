import React from 'react'
import { useTheme, TAS } from '../components/providers/ThemeProvider'
import Layout from '../components/layout/Layout'
import SEO from '../components/layout/SEO'
import PageWidthContainer from '../components/layout/PageWidthContainer'
// tslint:disable-next-line: no-var-requires
const data = require('../../content/reading/books.yaml')

export default function AboutPage() {
  const theme = useTheme()

  return (
    <Layout>
      <SEO title={'Current Reading'} />
      <div
        className={TAS(theme, {
          baseStyles: 'py-6 font-serif leading-relaxed',
          light: 'text-gray-900 bg-white',
          dark: 'text-gray-100 bg-gray-900',
        })}
      >
        <PageWidthContainer narrow>
          <h1 className="font-bold text-3xl mb-3">On the Nightstand</h1>
          {data.current.map((book: any, index: number) => (
            <div className="flex my-12">
              <img
                src={book.image}
                alt=""
                className="h-24 mr-4 object-contain"
              />
              <div className="flex flex-col justify-center">
                <div
                  className={TAS(theme, {
                    baseStyles: 'text-lg font-bold',
                    light: 'text-blue-800',
                    dark: 'text-blue-200',
                  })}
                >
                  {book.title}
                </div>
                <div>{book.author}</div>
                <div>Progress: {book.pages}</div>
                {book.notes ? <div className="italic">{book.notes}</div> : null}
              </div>
            </div>
          ))}
        </PageWidthContainer>
      </div>
    </Layout>
  )
}
