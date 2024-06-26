/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				mono: ["Jetbrains Mono", "monospace"],
				sans: ["Lexend", "system-ui", "sans-serif"],
				serif: ["Source Serif Pro", "sans-serif"],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
}
