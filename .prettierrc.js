/** @type {import('prettier').Config} */
module.exports = {
	plugins: [
		require.resolve("prettier-plugin-astro"),
		require.resolve("prettier-plugin-tailwindcss"),
	],
	useTabs: true,
	semi: false,
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
}
