import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://yaffle.xyz/",
  base: "/meme-wall/",
  trailingSlash: "always",
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
