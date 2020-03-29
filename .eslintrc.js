module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "testing-library", "jest-dom"],
  extends: [
    "react-app",
    "prettier",
    "plugin:testing-library/recommended",
    "plugin:jest-dom/recommended",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-curly-brace-presence": [
      2,
      { props: "never", children: "never" },
    ],
    "jsx-a11y/anchor-is-valid": "off", // because of the way that next.js <Link> works we can't render a `href` manually for a lot of <a> elements
  },
};
