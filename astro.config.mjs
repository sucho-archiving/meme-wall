import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://sucho.org/",
  base: "/meme-gallery/",
  trailingSlash: "always",
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
