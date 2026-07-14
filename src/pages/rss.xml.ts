import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { externalWriting } from "../data/external-writing";
import { siteConfig } from "../config/site";

export async function GET(context: { site?: URL }) {
  const internal = await getCollection("writing", ({ data, id }) => !data.draft && id !== "_template");
  const internalItems = internal.map((entry) => ({
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.publishDate,
    link: `/writing/${entry.id}/`,
    categories: [entry.data.category, ...entry.data.tags]
  }));
  const externalItems = externalWriting
    .filter((entry) => entry.externalUrl && entry.publishDate)
    .map((entry) => ({
      title: entry.title,
      description: `${entry.description}（发布于 ${entry.platform}）`,
      pubDate: new Date(entry.publishDate as string),
      link: entry.externalUrl,
      categories: [entry.category, ...entry.tags]
    }));

  return rss({
    title: `${siteConfig.name} — Writing`,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: [...internalItems, ...externalItems].sort(
      (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
    ),
    customData: `<language>zh-CN</language>`
  });
}
