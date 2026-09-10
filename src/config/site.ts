export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || "https://ansyn.me";

export const siteConfig = {
  name: "Ansyn Lab",
  chineseName: "安寻",
  displayName: "安寻 Ansyn",
  title: "Ansyn Lab | An ongoing experiment in the real world",
  description:
    "A young person finding a way into the real world with AI. An open record by Ansyn.",
  tagline: "在喧嚣中保持理智，在数字世界中探索同步。",
  language: "en",
  locale: "en_US",
  siteUrl: SITE_URL,
  social: {
    x: "https://x.com/Ansyn_07",
    github: "https://github.com/7-an",
    telegram: "https://t.me/Ansyn_7",
    // TODO: 有公开联系邮箱后填入 mailto: 链接；为空时页面不会显示入口。
    email: "",
    // TODO: 填入微信号后，联系方式区会显示微信图标（点击复制微信号）；为空时不显示。
    wechat: ""
  },
  kosx: {
    name: "KOSX.ai",
    url: "https://kosx.ai"
  },
  keywords: [
    "安寻",
    "Ansyn",
    "AI个人成长",
    "07后",
    "学习系统",
    "Building in public",
    "个人系统",
    "AI创业",
    "Web3学习"
  ]
} as const;
