import { externalWriting, platformLabels } from "../data/external-writing";

export function initWriting() {
  const root = document.querySelector<HTMLElement>("[data-writing]");
  if (!root) return;
  const entries = [...root.querySelectorAll<HTMLElement>("[data-writing-entry]")];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-writing-platform]")];
  const category = root.querySelector<HTMLSelectElement>("[data-writing-category]");
  const count = root.querySelector<HTMLElement>("[data-writing-count]");
  const empty = root.querySelector<HTMLElement>("[data-writing-empty]");
  const preview = root.querySelector<HTMLElement>("[data-writing-preview]");
  const columns = root.querySelector<HTMLElement>(".writing-columns");
  const mediaFigures = [...root.querySelectorAll<HTMLElement>("[data-preview-media-index]")];
  const video = preview?.querySelector<HTMLVideoElement>("video");
  const videoToggle = preview?.querySelector<HTMLButtonElement>("[data-video-toggle]");
  const desktop = matchMedia("(min-width: 760px) and (hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let platform = "all";
  let active: HTMLElement | null = null;
  let animation: Animation | undefined;
  const sticky = root.querySelector<HTMLElement>(".writing-preview-sticky");
  let lift = 0;
  let frame = 0;
  const fitPreview = () => {
    frame = 0;
    if (!active || !sticky || !desktop.matches) return;
    const rect = sticky.getBoundingClientRect();
    const baseTop = rect.top - lift;
    const topLimit = Math.min(96, innerHeight * .14);
    lift = Math.min(0, Math.max(topLimit - baseTop, innerHeight - 24 - (baseTop + rect.height)));
    sticky.style.translate = `0 ${lift}px`;
  };
  const scheduleFit = () => { if (!frame) frame = requestAnimationFrame(fitPreview); };
  addEventListener("scroll", scheduleFit, { passive: true });
  addEventListener("resize", scheduleFit);

  const hide = () => {
    active = null;
    preview?.classList.remove("is-visible");
    if (preview) preview.inert = true;
    animation?.cancel();
    video?.pause();
  };
  const syncVideoButton = () => {
    if (!video || !videoToggle) return;
    videoToggle.textContent = video.paused ? "Play ↗" : "Pause Ⅱ";
    videoToggle.setAttribute("aria-label", video.paused ? "Play particle preview" : "Pause particle preview");
  };
  const playVideo = () => {
    if (!video) return;
    if (!video.getAttribute("src")) video.src = video.dataset.videoSrc ?? "";
    video.muted = true;
    void video.play().then(() => {
      if (!active || document.hidden || !desktop.matches || video.closest<HTMLElement>("figure")?.hidden) {
        video.pause();
        return;
      }
      video.hidden = false;
    }).catch(() => { syncVideoButton(); });
  };
  video?.addEventListener("play", syncVideoButton);
  video?.addEventListener("pause", syncVideoButton);
  video?.addEventListener("error", () => {
    video.hidden = true;
    if (videoToggle) videoToggle.hidden = true;
  });
  videoToggle?.addEventListener("click", () => {
    if (video?.paused) playVideo(); else video?.pause();
  });
  for (const img of root.querySelectorAll<HTMLImageElement>(".writing-inline-media img, .writing-preview-media img")) {
    img.addEventListener("load", scheduleFit);
    img.addEventListener("error", () => {
      const figure = img.closest<HTMLElement>("figure");
      if (figure) { figure.dataset.failed = ""; figure.hidden = true; }
      if (figure?.dataset.previewMediaIndex === active?.dataset.writingEntry) preview?.classList.remove("has-media");
    });
  }
  const show = (entry: HTMLElement) => {
    if (!desktop.matches || !preview || entry.hidden || active === entry) return;
    const index = Number(entry.dataset.writingEntry);
    const article = externalWriting[index];
    if (!article) return;
    const swapping = !!active;
    video?.pause();
    if (video) video.hidden = true;
    active = entry;
    let hasMedia = false;
    for (const figure of mediaFigures) {
      const selected = figure.dataset.previewMediaIndex === String(index) && !("failed" in figure.dataset);
      figure.hidden = !selected;
      if (selected) hasMedia = true;
    }
    preview.classList.toggle("has-media", hasMedia);
    preview.inert = false;
    if (article.media?.videoSrc && video && hasMedia) {
      if (video.readyState > 0) video.currentTime = 0;
      if (!reduced.matches) playVideo();
    }
    const values: Record<string, string> = {
      "number": String(index + 1).padStart(2, "0"),
      "category": article.category,
      "text": article.description,
      "platform": article.externalUrl ? `Read on ${platformLabels[article.platform]}` : "Original link coming soon"
    };
    for (const [key, value] of Object.entries(values)) {
      const element = preview.querySelector<HTMLElement>(`[data-preview-${key}]`);
      if (element) element.textContent = value;
    }
    fitPreview();
    preview.classList.add("is-visible");
    animation?.cancel();
    if (swapping && !reduced.matches) {
      const text = preview.querySelector<HTMLElement>("[data-preview-text]");
      animation = text?.animate([{ opacity: .25, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 320, easing: "cubic-bezier(.16,1,.3,1)" });
    }
  };
  for (const entry of entries) {
    entry.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") show(entry); });
    entry.addEventListener("focusin", () => show(entry));
    entry.addEventListener("focusout", event => {
      if (!(event.relatedTarget instanceof Node) || !columns?.contains(event.relatedTarget)) hide();
    });
  }
  columns?.addEventListener("pointerleave", () => {
    if (preview?.contains(document.activeElement)) return;
    const focused = entries.find(entry => entry.contains(document.activeElement));
    if (focused) show(focused); else hide();
  });
  root.addEventListener("keydown", event => { if (event.key === "Escape") hide(); });
  desktop.addEventListener("change", hide);
  reduced.addEventListener("change", () => {
    animation?.cancel();
    if (reduced.matches && video) { video.pause(); video.hidden = true; }
  });
  preview?.addEventListener("focusout", event => {
    if (!(event.relatedTarget instanceof Node) || !columns?.contains(event.relatedTarget)) hide();
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  addEventListener("blur", hide);
  const update = () => {
    hide();
    let visible = 0;
    for (const entry of entries) {
      const matches = (platform === "all" || platform === entry.dataset.platform) && (!category || category.value === "all" || category.value === entry.dataset.category);
      entry.hidden = !matches;
      if (matches) visible++;
    }
    if (count) count.textContent = `${visible} ${visible === 1 ? "entry" : "entries"}`;
    if (empty) empty.hidden = visible !== 0;
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.writingPlatform === platform));
  };
  for (const button of buttons) button.addEventListener("click", () => { platform = button.dataset.writingPlatform ?? "all"; update(); });
  category?.addEventListener("change", update);
  root.setAttribute("data-writing-enhanced", "");
}
