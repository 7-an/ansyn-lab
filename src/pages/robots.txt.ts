import { siteConfig } from "../config/site";

export function GET(context: { site?: URL }) {
  const site = context.site ?? new URL(siteConfig.siteUrl);
  const sitemap = new URL("/sitemap-index.xml", site);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
