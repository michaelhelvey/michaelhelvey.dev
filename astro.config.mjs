import image from "@astrojs/image";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import getReadingTime from "reading-time";
import { toString } from "./plugins/mdast-util-to-string";
import nightOwlTheme from "./src/styles/night_owl.json";
import mdx from "@astrojs/mdx";

function remarkReadingTime() {
  return (tree, {
    data
  }) => {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    const maxSummary = 300;
    const summaryText = textOnPage.length > maxSummary ? textOnPage.slice(0, maxSummary) + "..." : textOnPage;
    data.astro.frontmatter.readingTime = readingTime;
    data.astro.frontmatter.summary = summaryText;
  };
}



// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), image(), mdx()],
  vite: {
    ssr: {
      external: ["svgo"]
    }
  },
  markdown: {
    shikiConfig: {
      theme: nightOwlTheme
    },
    remarkPlugins: [remarkReadingTime]
  }
});