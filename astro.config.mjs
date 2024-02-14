import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://memes.sucho.org/",
  trailingSlash: "always",
  integrations: [svelte()],
  build: {
    assets: "assets",
  },
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
