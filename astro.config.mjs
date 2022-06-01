import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://sucho.org/",
  base: "/meme-gallery/",
  trailingSlash: "always",
  integrations: [sitemap()],
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
