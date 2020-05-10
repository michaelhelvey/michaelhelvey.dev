module.exports = {
  plugins: [
    "tailwindcss",
    "autoprefixer",
    [
      "@fullhuman/postcss-purgecss",
      process.env.NODE_ENV === "production"
        ? {
            content: ["./src/**/*.{ts,tsx}"],
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
          }
        : false,
    ],
    "postcss-preset-env",
    "postcss-nesting",
  ],
}
