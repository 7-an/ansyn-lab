export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || "https://ansyn-lab.vercel.app";

export const siteConfig = {
  name: "Ansyn Lab",
  chineseName: "安寻",
  displayName: "安寻 Ansyn",
  title: "安寻 Ansyn｜07后AI时代个人成长实验",
  description:
    "记录一个18岁年轻人如何利用AI、互联网和个人系统，从高中环境进入真实世界。",
  tagline: "在喧嚣中保持理智，在数字世界中探索同步。",
  language: "zh-CN",
  locale: "zh_CN",
  siteUrl: SITE_URL,
  social: {
    x: "https://x.com/Ansyn_07",
    // TODO: 有公开 GitHub 主页后填入完整 URL；为空时页面不会显示入口。
    github: "",
    // TODO: 有公开联系邮箱后填入 mailto: 链接；为空时页面不会显示入口。
    email: ""
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
