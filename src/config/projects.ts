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
        src: "/images/voidtype-cover.png",
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
        src: "/kimi/study-path-cover.png",
        alt: "AI Study Path Triage project cover",
        width: 1672,
        height: 941
      },
      {
        src: "/kimi/study-path-workflow.png",
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
    title: "Personal Websites",
    cover: {lines: ["Personal", "websites."], number: "02"},
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
    cover: {lines: ["Daily", "notes."], number: "03"},
    description: "Useful ideas in community digests are easily lost when they stay inside the chat.",
    role: "Synthesis · Content adaptation · Distribution experiments",
    deliverable: "Adapted content from community digests, with work ongoing.",
    next: "Test distribution beyond the community and record readership and feedback.",
    status: "IN PROGRESS",
    org: "KOSX / COMMUNITY COLLABORATION",
    gallery: [], links: []
  }
];
