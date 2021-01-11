module.exports = {
	purge: ["./src/pages/**/*.tsx", "./src/components/**/*.tsx"],
	darkMode: false, // or 'media' or 'class'
	theme: {
		fontFamily: {
			sans: ["PT Sans", "sans-serif"],
			serif: ["PT Serif", "serif"],
		},
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography")],
}
