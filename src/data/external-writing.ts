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
  media?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    videoSrc?: string;
    caption?: string;
  };
};

export const externalWriting: ExternalArticle[] = [
  {
    title: "7 天 AI 学习实验：把成功、误判和失败一起开源",
    description: "What feedback from six high school students taught me about AI plans, human support and daily adjustments. What worked, what I misjudged and the limits of a small sample. A research prototype, with no promise of better grades.",
    platform: "X",
    publishDate: "2026-07-27",
    category: "Learning System",
    tags: ["AI 学习", "实验复盘", "人工反馈", "开源"],
    externalUrl: "https://x.com/Ansyn_07/status/2081763400565289061",
    media: {
      src: "/media/writing/study-path.webp",
      alt: "Cover for a seven-day AI study experiment with six students, with green type and a laptop on black",
      width: 1000, height: 563,
      caption: "Image from the open-source follow-up posted on July 28."
    }
  },
  {
    title: "离开深圳之前：一个月的经历与回顾",
    description: "From meetups and content experiments to a first practical project and an internship at KOSX. Before leaving Shenzhen, I look back at the people, the work and a direction slowly taking shape.",
    platform: "X",
    publishDate: "2026-08-12",
    category: "Field Notes",
    tags: ["深圳", "KOSX", "实习", "个人成长"],
    externalUrl: "https://x.com/Ansyn_07/status/2087568560100987041",
    media: {
      src: "/media/writing/city-field-note.webp",
      alt: "Blue-hour street scene from the original post, with towers, palms and streetlights",
      width: 800, height: 1067
    }
  },
  {
    title: "闲鱼卖 GPT 两天赚了 1k+：第一次跑通小生意闭环",
    description:
      "A first-hand review of sourcing, finding customers on Xianyu, delivery and repeat purchases. A small amount of money, but my first full encounter with pricing, demand and running a small business.",
    platform: "X",
    publishDate: "2026-08-30",
    category: "Business Experiment",
    tags: ["闲鱼", "代充", "商业闭环", "获客", "复购", "复盘"],
    externalUrl: "https://x.com/Ansyn_07/status/2094003450875097417?s=20",
    featured: true
  },
  {
    title: "两天 1k+：闲鱼代充完整 SOP",
    description: "A record of sourcing, listings, sales, delivery and support in my first small business. This describes the process at the time; later posts note changes to some listing copy and practices.",
    platform: "X",
    publishDate: "2026-09-04",
    category: "Business Experiment",
    tags: ["SOP", "商业实验", "复盘"],
    externalUrl: "https://x.com/Ansyn_07/status/2095857885905596817",
    media: {
      src: "/media/writing/xianyu-sop.webp",
      alt: "Yellow cover for the Xianyu SOP post, with a Luffy illustration",
      width: 1000, height: 563
    }
  },
  {
    title: "重塑个人网站：AI 时代，个人网站是一个人的赛博形象",
    description: "A short post with a screen recording of the rebuilt ansyn.me, asking for feedback. I used to call a personal website the best résumé in the age of AI; now it feels closer to a person's online self.",
    platform: "X",
    publishDate: "2026-09-10",
    category: "Website",
    tags: ["个人网站", "ansyn.me", "Building in public"],
    externalUrl: "https://x.com/Ansyn_07/status/2098049943638540740"
  },
  {
    title: "从零拥有个人网站①｜网页做好了，怎么让别人打开？",
    description: "A plain-language guide to putting a website online: what GitHub, Vercel, domains and DNS each do, a first launch with GitHub + Vercel, connecting your own domain, and what updates and running costs look like afterwards.",
    platform: "X",
    publishDate: "2026-09-13",
    category: "Website Guide",
    tags: ["个人网站", "部署", "域名", "教程"],
    externalUrl: "https://x.com/Ansyn_07/status/2099121286249316533"
  },
  {
    title: "作为 KOSX 实习生，我心目中的 KOSX",
    description: "Why I joined KOSX with a few hundred followers, what its youth internship programme meant to someone without prior experience, and a community poster I made with Codex to describe it.",
    platform: "X",
    publishDate: "2026-09-20",
    category: "Field Notes",
    tags: ["KOSX", "实习", "Codex", "海报"],
    externalUrl: "https://x.com/Ansyn_07/status/2101623802056904760",
    media: {
      src: "/media/writing/kosx-poster.webp",
      alt: "KOSX poster made with Codex: BEYOND THE SURFACE. Three small figures stand inside a curling sheet of paper lit in orange",
      width: 900, height: 1200
    }
  },
  {
    title: "我的建站 Skill 开源了",
    description: "Six working methods and over a dozen lessons from building websites with AI, packaged as a Codex skill for personal sites, portfolios and redesigns. Feedback is welcome.",
    platform: "X",
    publishDate: "2026-09-30",
    category: "Open Source",
    tags: ["建站", "Skill", "Codex", "开源"],
    externalUrl: "https://x.com/Ansyn_07/status/2105123519294300496",
    media: {
      src: "/media/writing/website-skill.webp",
      alt: "The six steps in the website skill: clarify requirements, find references, read source code, protect finished work, test the real experience, plan for maintenance",
      width: 1000, height: 382
    }
  },
  {
    title: "从零拥有个人网站②｜从想法到成品，用 AI 做出自己的风格",
    description: "Half a month in the making: how a website splits into information architecture and visual expression, how to find and read references, how to turn taste into design decisions, then building and deploying with AI.",
    platform: "X",
    publishDate: "2026-10-09",
    category: "Website Guide",
    tags: ["个人网站", "设计", "信息架构", "教程"],
    externalUrl: "https://x.com/Ansyn_07/status/2108493932766368240",
    featured: true
  },
  {
    title: "复刻 newmix 首页：改了十几遍才做成的粒子交互实验",
    description:
      "While building a personal website for Liu, I tried to recreate the particle effect on the newmix homepage. It took more than a dozen revisions. The resulting demo and code are public.",
    platform: "X",
    publishDate: "2026-08-18",
    category: "Interactive Experiment",
    tags: ["VOIDTYPE", "粒子交互", "网站实验", "开源", "复盘"],
    externalUrl: "https://x.com/Ansyn_07/status/2089705756920803546?s=20",
    media: {
      src: "/media/writing/voidtype-poster.webp",
      alt: "VOIDTYPE particle demo with white type on black, responding to the pointer",
      width: 960, height: 472,
      videoSrc: "/media/writing/voidtype-preview.mp4"
    },
    featured: true
  },
  {
    title: "参加AI创业交流会后，我学到的九件事",
    description:
      "Reflections after an AI, entrepreneurship and Web3 meetup: taking action, real users, personal identity, distribution, AI applications and testing ideas in the market.",
    platform: "X",
    publishDate: "2026-07-11",
    category: "AI & Business",
    tags: ["AI", "创业", "个人IP", "行动力", "Web3"],
    externalUrl: "https://x.com/Ansyn_07/status/2075935184252440840?s=20",
    featured: true
  },
  {
    title: "我理解AI的第一堂课，来自一段失败的恋爱",
    description:
      "I once tried to understand a relationship through AI. It can help with self-reflection, but it can also turn our expectations, biases and fantasies into a convincing story.",
    platform: "X",
    publishDate: "2026-07-13",
    category: "AI & Self-awareness",
    tags: ["AI", "个人成长", "关系", "认知", "反思"],
    externalUrl: "https://x.com/Ansyn_07/status/2076670280618164255?s=20",
    featured: true
  },
  {
    title: "为什么叫 Ansyn：安定、同步与探索",
    description: "An comes from my Chinese name and a sense of inner steadiness. Syn comes from sync: a reminder to stay open to new information. Together, they describe how I want to keep exploring.",
    platform: "X",
    publishDate: "2026-08-21",
    category: "About Ansyn",
    tags: ["名字", "自我介绍", "个人思考"],
    externalUrl: "https://x.com/Ansyn_07/status/2090680459869245784"
  },
  {
    title: "重新介绍一下自己：一个07后为什么开始探索AI、创业和Web3",
    description:
      "An introduction written at 18: my background and why I began exploring AI, personal identity, the global internet and business beyond high school.",
    platform: "X",
    publishDate: "2026-07-12",
    category: "About Ansyn",
    tags: ["自我介绍", "07后", "AI", "Building in public", "个人成长"],
    externalUrl: "https://x.com/Ansyn_07/status/2076300159370334504?s=20",
    featured: true
  },
  {
    title: "高三提分不是靠鸡血，而是一套能跑起来的学习系统",
    description:
      "A study system drawn from independent study in my final school year, AI assistance and ongoing reflection: mindset, identifying problems, execution, time management, practice and feedback.",
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
  Douyin: "Douyin",
  Xiaohongshu: "Xiaohongshu",
  Bilibili: "Bilibili",
  Other: "External platform"
};
