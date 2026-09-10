/** Pointer-local reveals for the homepage's Work and Writing directory entries. */
export function initHomeDirectory() {
  const root = document.querySelector<HTMLElement>("[data-home-directory]");
  const preview = document.querySelector<HTMLElement>("[data-directory-preview]");
  if (!root || !preview) return;
  const rows = [...root.querySelectorAll<HTMLAnchorElement>("[data-directory-peek]")];
  const cards = [...preview.querySelectorAll<HTMLElement>("[data-directory-card]")];
  const desktop = matchMedia("(min-width: 760px) and (hover: hover) and (pointer: fine)");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => motion.matches || document.documentElement.hasAttribute("data-reduced");
  let active: HTMLElement | null = null;
  let frame = 0;
  let hoverFrame = 0;
  let pointer: { x: number; y: number } | null = null;
  let dismissed: HTMLElement | null = null;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const render = () => {
    frame = 0;
    x += (targetX - x) * .2;
    y += (targetY - y) * .2;
    preview.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (active && Math.abs(targetX - x) + Math.abs(targetY - y) > .3) frame = requestAnimationFrame(render);
  };
  const position = (clientX: number, clientY: number, immediate = false) => {
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    const preferredX = clientX + 28 + width < innerWidth - 24 ? clientX + 28 : clientX - width - 28;
    targetX = Math.max(24, Math.min(preferredX, innerWidth - width - 24));
    targetY = Math.max(88, Math.min(clientY - height * .4, innerHeight - height - 24));
    if (immediate || reduced()) { x = targetX; y = targetY; preview.style.transform = `translate3d(${x}px,${y}px,0)`; }
    else if (!frame) frame = requestAnimationFrame(render);
  };
  const hide = () => { active = null; cancelAnimationFrame(frame); frame = 0; preview.classList.remove("is-visible"); };
  const show = (row: HTMLElement, clientX?: number, clientY?: number) => {
    if (!desktop.matches) return;
    const fresh = active !== row;
    active = row;
    for (const card of cards) card.hidden = card.dataset.directoryCard !== row.dataset.directoryPeek;
    const rect = row.getBoundingClientRect();
    position(clientX ?? rect.right - preview.offsetWidth - 60, clientY ?? rect.top + rect.height / 2, fresh);
    preview.classList.add("is-visible");
  };
  const warmImages = () => {
    preview.querySelectorAll<HTMLImageElement>("img").forEach(image => { image.loading = "eager"; });
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { warmImages(); observer.disconnect(); }
    }, { rootMargin: "240px" });
    observer.observe(root);
  }
  const syncHover = () => {
    hoverFrame = 0;
    if (!desktop.matches || document.hidden) { hide(); return; }
    const hit = pointer ? document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>("[data-directory-peek]") : null;
    const hovered = hit && rows.includes(hit as HTMLAnchorElement) ? hit : null;
    const focused = rows.find(row => row.matches(":focus-visible"));
    if (hovered && hovered !== dismissed) show(hovered, pointer!.x, pointer!.y);
    else if (focused && focused !== dismissed) show(focused);
    else hide();
  };
  const scheduleHover = () => { if (!hoverFrame) hoverFrame = requestAnimationFrame(syncHover); };
  for (const row of rows) {
    row.addEventListener("pointerenter", e => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      dismissed = null;
      warmImages();
      show(row, e.clientX, e.clientY);
    });
    row.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse" || dismissed === row) return;
      pointer = { x: e.clientX, y: e.clientY };
      // A scroll, layout shift or focus change may have hidden the preview without
      // producing another pointerenter. Movement inside the row must recover it.
      if (active !== row) show(row, e.clientX, e.clientY);
      else if (!reduced()) position(e.clientX, e.clientY);
    });
    row.addEventListener("pointerleave", () => {
      if (dismissed === row) dismissed = null;
      hide();
      scheduleHover();
    });
    row.addEventListener("focusin", () => { dismissed = null; warmImages(); show(row); });
    row.addEventListener("focusout", scheduleHover);
    row.addEventListener("keydown", e => { if (e.key === "Escape") { dismissed = row; hide(); } });
  }
  document.addEventListener("pointermove", e => {
    if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer = null; hide(); });
  // Scroll can move a row under a stationary pointer, or move it away. Hit-test
  // once per frame instead of unconditionally clearing the active row.
  addEventListener("scroll", scheduleHover, { passive: true });
  addEventListener("resize", scheduleHover);
  addEventListener("blur", () => { pointer = null; hide(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { pointer = null; hide(); } });
  desktop.addEventListener("change", scheduleHover);
  motion.addEventListener("change", scheduleHover);
  const initiallyHovered = rows.find(row => row.matches(":hover"));
  if (initiallyHovered) { warmImages(); show(initiallyHovered); }
  root.setAttribute("data-directory-ready", "");
}
