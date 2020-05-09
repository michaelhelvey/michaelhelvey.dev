import React from "react"
import ReactDOM from "react-dom"
import { AppProps } from "next/app"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"
import "typeface-pt-sans"
import "typeface-pt-serif"
import "styles/global.css"

library.add(faBars, faTimes)

function CustomApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default CustomApp

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const axe = require("react-axe")
  axe(React, ReactDOM, 1000)
}
