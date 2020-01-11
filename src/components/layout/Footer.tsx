import React from 'react'
import PageWidthContainer from './PageWidthContainer'

export default function Footer() {
  return (
    <footer
      className="bg-gray-100 flex justify-center border-t border-gray-300"
      style={{ height: '50px', marginTop: '-50px' }}
    >
      <PageWidthContainer>
        <div className="py-4 text-xs text-gray-800">
          Copyright &copy; 2020-present Michael Helvey.{' '}
          <span className="italic">SDG.</span>
        </div>
      </PageWidthContainer>
    </footer>
  )
}
