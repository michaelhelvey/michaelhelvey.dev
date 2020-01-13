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
      <SEO title={'About'} />
      <div
        className={TAS(theme, {
          baseStyles: 'py-6 font-serif leading-relaxed',
          light: 'text-gray-900',
          dark: 'text-gray-100',
        })}
      >
        <PageWidthContainer narrow>
          <h1 className="font-bold text-3xl">About</h1>
          <p className="mt-4">
            I’m Michael Helvey, that is, a Christian, a reader of books, a
            graduate of New Saint Andrews College, a Southerner, and a lover of
            Dostoevsky, my pipe, the Patristics, Kentucky bourbon, Medieval
            literature, Renaissance choral music, Dark Souls games, and my
            family. And much else besides, but one must keep these lists in
            check somehow. I once was a violinist, and occasionally pretend to
            be a poet. I put earn my daily bread writing software for the web
            (you can see the code for this site, for example,{' '}
            <a
              href="https://github.com/michaelhelvey/michaelhelvey.dev"
              className={TAS(theme, {
                baseStyles: 'underline',
                dark: 'text-blue-300',
                light: 'text-blue-800',
              })}
            >
              here
            </a>
            ).
          </p>
          <p className="mt-4">
            I make no claim to knowledge, or the spreading of it by means of
            this blog. This is where I reflect on my studies, and post the
            occasional original thought or poem as it occurs to me, as a means
            of discipline for myself. I’ve been deeply influenced by St.
            Benedict, and take the motto of the Benedictines, ora et labora, as
            the motto for my own life.
          </p>
          <p className="mt-4 italic">
            Lamb of God, who taketh away the sins of the world, have mercy upon
            us, and grant us thy peace.
          </p>
        </PageWidthContainer>
      </div>
    </Layout>
  )
}
