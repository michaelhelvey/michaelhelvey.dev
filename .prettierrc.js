/** @type {import('prettier').Config} */
module.exports = {
	plugins: [
		require.resolve("prettier-plugin-astro"),
		require.resolve("prettier-plugin-tailwindcss"),
	],
	useTabs: true,
	semi: false,
	printWidth: 100,
	proseWrap: "always",
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
}
