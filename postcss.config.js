const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.{ts,tsx}"],
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
})

module.exports = {
  plugins: [
    "tailwindcss",
    "autoprefixer",
    ...(process.env.NODE_ENV === "production" ? [purgecss] : []),
    "postcss-preset-env",
    "postcss-nesting",
  ],
}
