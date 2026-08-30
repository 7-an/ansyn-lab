export type ExternalPlatform =
  | "X"
  | "Douyin"
  | "Xiaohongshu"
  | "Bilibili"
  | "Other";

export type ExternalArticle = {
  title: string;
  description: string;
  platform: ExternalPlatform;
  publishDate?: string;
  category: string;
  tags: string[];
  externalUrl: string;
  featured?: boolean;
};

export const externalWriting: ExternalArticle[] = [
  {
    title: "闲鱼卖 GPT 两天赚了 1k+：第一次跑通小生意闭环",
    description:
      "从稳定供给、闲鱼获客、成交交付到售后复购的真实复盘。金额不大，但这是我第一次完整接触定价、用户需求与商业闭环。",
    platform: "X",
    publishDate: "2026-08-30",
    category: "Business Experiment",
    tags: ["闲鱼", "代充", "商业闭环", "获客", "复购", "复盘"],
    externalUrl: "https://x.com/Ansyn_07/status/2094003450875097417?s=20",
    featured: true
  },
  {
    title: "复刻 newmix 首页：改了十几遍才做成的粒子交互实验",
    description:
      "为刘哥制作个人网站时，我尝试复刻 newmix 首页的粒子效果。过程远比想象中复杂，反复调整十几遍后完成，并把在线演示与代码一同公开。",
    platform: "X",
    publishDate: "2026-08-18",
    category: "Interactive Experiment",
    tags: ["VOIDTYPE", "粒子交互", "网站实验", "开源", "复盘"],
    externalUrl: "https://x.com/Ansyn_07/status/2089705756920803546?s=20",
    featured: true
  },
  {
    title: "参加AI创业交流会后，我学到的九件事",
    description:
      "参加一场AI、创业与Web3交流会后的系统复盘，内容涉及行动、真实用户、个人IP、流量、AI应用层、商业验证，以及年轻人如何进入真实市场。",
    platform: "X",
    category: "AI & Business",
    tags: ["AI", "创业", "个人IP", "行动力", "Web3"],
    externalUrl: "https://x.com/Ansyn_07/status/2075935184252440840?s=20",
    featured: true
  },
  {
    title: "我理解AI的第一堂课，来自一段失败的恋爱",
    description:
      "我曾试图用AI解释一段关系，最后发现AI既能帮助人认识自己，也可能把人的期待、偏见和幻想，补全成一套看似合理的理论。",
    platform: "X",
    category: "AI & Self-awareness",
    tags: ["AI", "个人成长", "关系", "认知", "反思"],
    externalUrl: "https://x.com/Ansyn_07/status/2076670280618164255?s=20",
    featured: true
  },
  {
    title: "重新介绍一下自己：一个07后为什么开始探索AI、创业和Web3",
    description:
      "一篇关于安寻身份、成长背景与未来方向的自我介绍，记录一个18岁年轻人如何从高中环境开始探索AI、个人IP、全球互联网与商业。",
    platform: "X",
    category: "About Ansyn",
    tags: ["自我介绍", "07后", "AI", "Building in public", "个人成长"],
    externalUrl: "https://x.com/Ansyn_07/status/2076300159370334504?s=20",
    featured: true
  },
  {
    title: "高三提分不是靠鸡血，而是一套能跑起来的学习系统",
    description:
      "根据高三自学、AI辅助和持续复盘总结出的学习系统，核心包括心态、问题定位、执行、时间管理、反馈与刷题闭环。",
    platform: "Douyin",
    category: "Learning System",
    tags: ["高三", "学习系统", "复盘", "AI学习", "时间管理"],
    // TODO: 将抖音标准分享链接（例如 https://v.douyin.com/...）填在这里；组件会自动恢复为可点击状态。
    externalUrl: "",
    featured: true
  }
];

export const platformLabels: Record<ExternalPlatform, string> = {
  X: "X",
  Douyin: "抖音",
  Xiaohongshu: "小红书",
  Bilibili: "B站",
  Other: "外部平台"
};
