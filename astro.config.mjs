import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import { astroImageTools } from "astro-imagetools";

// https://astro.build/config
export default defineConfig({
  site: "https://memes.sucho.org/",
  trailingSlash: "always",
  integrations: [astroImageTools, svelte()],
  build: {
    assets: "assets",
  },
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
