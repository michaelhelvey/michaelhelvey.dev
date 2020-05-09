import type { SEOProps } from "components/SEO"

import SEO from "components/SEO"
import Navigation from "components/Navigation"
import Footer from "components/Footer"

const Layout: React.FC<SEOProps> = ({ children, ...rest }) => (
  <div className="flex flex-col h-full">
    <header>
      <SEO {...rest} />
      <Navigation />
    </header>
    <div className="flex flex-col items-center flex-1">
      <main className="flex-1 w-full max-w-2xl p-4">{children}</main>
    </div>
    <footer>
      <Footer />
    </footer>
  </div>
)

export default Layout
