import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://memes.yaffle.xyz/",
  trailingSlash: "always",
  vite: {
    ssr: { external: ["neat-csv"] },
    optimizeDeps: { exclude: ["neat-csv"] },
  },
});
