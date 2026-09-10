import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import process from "node:process";

const site = process.env.PUBLIC_SITE_URL || "https://ansyn.me";

export default defineConfig({
  site,
  output: "static",
  vite: {
    // astro check/build also optimize dependencies. Keep their cache separate
    // from the live dev server so its existing dependency URLs remain valid.
    cacheDir: process.argv.includes("dev")
      ? "./node_modules/.vite/ansyn-dev"
      : "./node_modules/.vite/ansyn-check-build"
  },
  devToolbar: {
    enabled: false
  },
  integrations: [sitemap()],
  build: {
    format: "directory"
  }
});
