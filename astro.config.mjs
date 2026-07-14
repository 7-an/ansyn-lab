import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import process from "node:process";

const site = process.env.PUBLIC_SITE_URL || "https://ansyn-lab.vercel.app";

export default defineConfig({
  site,
  output: "static",
  integrations: [sitemap()],
  build: {
    format: "directory"
  }
});
