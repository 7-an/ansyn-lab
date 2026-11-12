import type { Project } from "../components/ProjectRows.astro";

export const featuredProjects: Project[] = [
  {
    org: "INDEPENDENT / INTERACTIVE EXPERIMENT",
    title: "VOIDTYPE",
    livePreview: "voidtype",
    description: "A standalone particle-type experiment extracted from a website project, exploring text sampling, fluid motion, inertial tilt and a natural return to rest.",
    role: "Interaction design · Parameter tuning · Development with AI",
    deliverable: "A Three.js / Vite demo, implementation notes and an open-source GitHub repository.",
    next: "Completed and open-sourced as a reusable starting point for future visual experiments.",
    status: "OPEN SOURCE / LIVE",
    fit: "contain",
    mediaBg: "#000000",
    gallery: [
      {
        src: "/images/voidtype-cover.webp",
        alt: "VOIDTYPE particle type: less is more. Slow down to speed up.",
        width: 2820,
        height: 1370
      }
    ],
    links: [
      { href: "https://7-an.github.io/voidtype/", label: "Try the demo ↗" },
      { href: "https://github.com/7-an/voidtype", label: "GitHub ↗" }
    ]
  },
  {
    org: "INDEPENDENT / OPEN SOURCE",
    title: "Website Playbook",
    description: "People kept asking how this website was made. I turned the methods and mistakes from building it with AI into a reusable Codex skill.",
    role: "Method design · Writing · Open-source maintainer",
    deliverable: "A Codex skill with six core methods, 16 lessons from building websites, brief and handover templates, plus two long-form website guides on X.",
    next: "Open-sourced. Improving it from readers' feedback and new website projects.",
    status: "OPEN SOURCE",
    fit: "contain",
    mediaBg: "#ffffff",
    gallery: [
      {
        src: "/media/writing/website-skill.webp",
        alt: "The six steps in the website skill: clarify requirements, find references, read source code, protect finished work, test the real experience, plan for maintenance",
        width: 1000,
        height: 382
      }
    ],
    links: [
      { href: "https://github.com/7-an/website-playbook", label: "GitHub ↗" },
      { href: "https://x.com/Ansyn_07/status/2108493932766368240", label: "Website guide ↗" }
    ]
  },
  {
    org: "INDEPENDENT / PERSONAL PROJECT",
    title: "Video Subtitle Extractor",
    description: "Many educational YouTube videos have no extractable subtitles, making their content harder to use with AI for notes and study.",
    role: "Problem discovery · Product design · Development with AI",
    deliverable: "A Chrome extension and local helper. It extracts existing subtitles or transcribes locally with Whisper, then exports MD, SRT, TXT or JSON.",
    next: "Completed and open-sourced. Currently available for macOS, with installation instructions in the repository.",
    status: "OPEN SOURCE / MACOS",
    fit: "contain",
    mediaBg: "#0f0f0f",
    gallery: [
      {
        src: "/images/video-subtitle-extractor-cover.svg",
        alt: "Video Subtitle Extractor workflow: extract YouTube subtitles or transcribe locally with Whisper, then export",
        width: 1600,
        height: 900
      }
    ],
    links: [
      { href: "https://github.com/7-an/video-subtitle-extractor", label: "GitHub ↗" },
      { href: "https://x.com/Ansyn_07/status/2086977360730149275?s=20", label: "Project notes ↗" }
    ]
  },
  {
    org: "INDEPENDENT / PERSONAL PROJECT",
    title: "AI Study Path Triage",
    description: "Started with over 100 student enquiries: moving from abundant study advice to a path a student can actually begin.",
    role: "Creator · Open-source maintainer",
    deliverable: "An open-source repository with prompts, rules, templates and anonymised cases.",
    next: "Archived. Further work will depend on a new question worth investigating.",
    status: "OPEN SOURCE / V0.1",
    fit: "contain",
    mediaBg: "#030303",
    gallery: [
      {
        src: "/images/study-path-cover.webp",
        alt: "AI Study Path Triage project cover",
        width: 1672,
        height: 941
      },
      {
        src: "/images/study-path-workflow.webp",
        alt: "AI Study Path Triage workflow",
        width: 1672,
        height: 941,
        fit: "cover"
      }
    ],
    links: [{ href: "https://github.com/7-an/ai-study-path-triage", label: "GitHub repository ↗" }]
  },
  {
    org: "INDEPENDENT / PERSONAL PROJECT",
    title: "Ansyn Lab",
    description: "A personal website as a lasting home for writing, projects and evidence of the work behind them.",
    role: "Requirements · Information architecture · Development with AI",
    deliverable: "ansyn.me and an access point for mainland China.",
    next: "Keep documenting projects and reflections over time.",
    status: "LIVE",
    fit: "cover",
    gallery: [
      {
        src: "/images/ansyn-lab-cover-square.png",
        alt: "Ansyn Lab cover: a personal experiment in growing up with AI",
        width: 1600,
        height: 1600
      }
    ],
    links: [{ href: "https://ansyn.me/", label: "Visit website ↗" }]
  }
];

export const communityProjects: Project[] = [
  {
    title: "Community Workspace",
    anchor: "kosx", cover: {lines: ["Community", "workspace."], number: "01"},
    description: "Community project information is scattered across chats. Activities, tasks and progress rely on manual updates.",
    role: "Workflow design · Information structure · Exploring uses for AI",
    deliverable: "A V0 Feishu Bitable workspace, workflow diagrams and a list of possible uses for AI.",
    next: "Trial it in a real community and record maintenance time and feedback.",
    status: "BUILDING",
    org: "KOSX / COMMUNITY COLLABORATION",
    gallery: [], links: []
  },
  {
    title: "KOSX.ai Website",
    cover: {lines: ["kosx.ai", "website."], number: "02"},
    description: "KOSX needed an official website that explains the community, its members, activities and projects in one place.",
    role: "Page building · Content structure · Development with AI · Launch support",
    deliverable: "The new kosx.ai, now live, with a content backend the team can update.",
    next: "Keep content and pages up to date as the community's projects and activities grow.",
    status: "LIVE",
    org: "KOSX / COMMUNITY COLLABORATION",
    gallery: [], links: [{ href: "https://kosx.ai/", label: "Visit kosx.ai ↗" }]
  },
  {
    title: "Personal Websites",
    cover: {lines: ["Personal", "websites."], number: "03"},
    description: "Community members need personal websites, but the path from requirements to launch needs a clearer process.",
    role: "Requirements · Information architecture · Development with AI · Revisions",
    deliverable: "Personal websites for community members, currently in progress.",
    next: "Complete revisions and launch, then document feedback from the people using them.",
    status: "BUILDING",
    org: "KOSX / COMMUNITY COLLABORATION",
    gallery: [], links: []
  },
  {
    title: "Community Daily Notes",
    cover: {lines: ["Daily", "notes."], number: "04"},
    description: "Useful ideas in community digests are easily lost when they stay inside the chat.",
    role: "Synthesis · Content adaptation · Distribution experiments",
    deliverable: "Adapted content from community digests, with work ongoing.",
    next: "Test distribution beyond the community and record readership and feedback.",
    status: "IN PROGRESS",
    org: "KOSX / COMMUNITY COLLABORATION",
    gallery: [], links: []
  }
];
