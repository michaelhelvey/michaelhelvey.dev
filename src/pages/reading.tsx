import React from 'react'
import { useTheme, TAS } from '../components/providers/ThemeProvider'
import Layout from '../components/layout/Layout'
import SEO from '../components/layout/SEO'
import PageWidthContainer from '../components/layout/PageWidthContainer'
import { faKissWinkHeart } from '@fortawesome/free-solid-svg-icons'

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
          <h1 className="font-bold text-3xl">On the Nightstand</h1>
        </PageWidthContainer>
      </div>
    </Layout>
  )
}
