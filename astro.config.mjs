// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://michaelhelvey.dev",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Source Serif Pro",
      cssVariable: "--font-serif",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Monaspace Neon",
      cssVariable: "--font-mono"
    }
  ],
});
