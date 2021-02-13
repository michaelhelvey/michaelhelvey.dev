import "tailwindcss/tailwind.css"
import "typeface-pt-serif"
import "typeface-pt-sans"
import { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}

export default MyApp
