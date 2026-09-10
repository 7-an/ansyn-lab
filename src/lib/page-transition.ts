import { pageTransitionNames } from "../config/page-transitions";

// Keep native document navigation: every page's canvas, observers and listeners
// get a fresh lifecycle. The session handoff keeps the curtain across documents.
const curtain = document.querySelector<HTMLDialogElement>("[data-page-transition]");
if (curtain) {
  const root = document.documentElement;
  const screen = curtain.querySelector<HTMLElement>(".page-transition-screen")!;
  const top = curtain.querySelector<HTMLElement>(".is-top")!;
  const bottom = curtain.querySelector<HTMLElement>(".is-bottom")!;
  const words = curtain.querySelector<HTMLElement>(".page-transition-label")!;
  const label = curtain.querySelector<HTMLElement>("[data-transition-label]")!;
  const key = "ansyn-page-transition";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const noMotion = () => reduced.matches || root.hasAttribute("data-reduced") || new URLSearchParams(location.search).get("motion") === "reduce";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const routes = pageTransitionNames;
  let busy = false;
  let navigating = false;
  let generation = 0;
  let watchdog = 0;
  let origin: HTMLElement | null = null;
  const animations = new Set<Animation>();
  const animate = async (element: HTMLElement, frames: Keyframe[], duration: number, easing: string, delay = 0) => {
    const animation = element.animate(frames, { duration, easing, delay, fill: "both" });
    animations.add(animation);
    try { await animation.finished; } catch { /* Cancellation is an expected recovery path. */ }
  };
  const clearToken = () => { try { sessionStorage.removeItem(key); } catch { /* Storage may be disabled. */ } };
  const releaseOpening = () => {
    if (!root.hasAttribute("data-opening-intro")) return;
    delete root.dataset.openingIntro;
    dispatchEvent(new Event("site:opening-reveal"));
  };
  const reset = (restoreFocus = false) => {
    generation++;
    clearTimeout(watchdog);
    animations.forEach(animation => animation.cancel());
    animations.clear();
    if (curtain.open) curtain.close();
    delete root.dataset.transitionIncoming;
    delete root.dataset.transitionTitle;
    delete root.dataset.transitionKeyboard;
    delete root.dataset.pageTransitioning;
    screen.removeAttribute("style");
    words.removeAttribute("style");
    top.removeAttribute("style");
    bottom.removeAttribute("style");
    busy = false;
    navigating = false;
    clearToken();
    releaseOpening();
    if (restoreFocus) origin?.focus({ preventScroll: true });
  };
  const show = () => {
    busy = true;
    root.dataset.pageTransitioning = "";
    curtain.showModal();
  };
  const destination = (link: HTMLAnchorElement) => {
    if (link.download || link.hasAttribute("download") || (link.target && link.target !== "_self") || link.hasAttribute("data-no-transition")) return null;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return null;
    if (base && !url.pathname.startsWith(base + "/")) return null;
    const route = url.pathname.slice(base.length).replace(/^\/|\/$/g, "");
    return routes[route] ? { url, names: routes[route] } : null;
  };
  const prefetched = new Set<string>();
  const prefetch = (link: HTMLAnchorElement) => {
    if (import.meta.env.DEV) return; // Do not cache stale HTML during live editing.
    const next = destination(link);
    if (!next || prefetched.has(next.url.href) || prefetched.size >= 5) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    prefetched.add(next.url.href);
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.as = "document";
    hint.href = next.url.href;
    document.head.append(hint);
  };
  for (const eventName of ["pointerover", "focusin"] as const) {
    document.addEventListener(eventName, event => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (link && !busy) prefetch(link);
    }, { passive: true });
  }
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link) return;
    const next = destination(link);
    if (!next || noMotion()) return;
    if (busy) { event.preventDefault(); return; }
    const title = next.names[root.lang === "zh-CN" ? 1 : 0];
    // When storage is unavailable, leave navigation entirely to the browser.
    try { sessionStorage.setItem(key, JSON.stringify({ url: next.url.href, title, keyboard: event.detail === 0, at: Date.now() })); } catch { return; }
    event.preventDefault();
    event.stopImmediatePropagation(); // The sidebar must not issue a second navigation.
    origin = link;
    label.textContent = title;
    prefetch(link);
    show();
    const turn = ++generation;
    watchdog = window.setTimeout(() => reset(true), 9000);
    void animate(top, [{ height: "0vh" }, { height: "10vh" }], 400, "cubic-bezier(.64,0,.78,0)");
    void animate(words, [{ opacity: 0, translate: "0 45px" }, { opacity: 1, translate: "0 0" }], 550, "cubic-bezier(.16,1,.3,1)", 300);
    void animate(screen, [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }], 500, "cubic-bezier(.64,0,.78,0)").then(() => {
      if (turn !== generation) return;
      // Close the sidebar only when covered; its original close handler restores scrolling.
      document.querySelector<HTMLDialogElement>("#site-menu[open]")?.close();
      navigating = true;
      location.assign(next.url.href);
    });
  }, true);

  const reveal = async () => {
    const keyboard = root.hasAttribute("data-transition-keyboard");
    const opening = root.hasAttribute("data-opening-intro");
    show();
    const turn = ++generation;
    screen.style.transform = "translateY(0)";
    words.style.opacity = opening ? "0" : "1";
    watchdog = window.setTimeout(() => reset(), 5000);
    // Paint the destination behind the curtain before lifting it. Font loading
    // has a short ceiling so a slow font can never trap someone behind a loader.
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 300))]);
    if (turn !== generation) return;
    if (opening) {
      // Match the reference's quiet arrival, quick language changes and final greeting.
      await animate(words, [{ opacity: 0, translate: "0 20px" }, { opacity: 1, translate: "0 0" }], 700, "cubic-bezier(.16,1,.3,1)", 250);
      for (const greeting of ["Bonjour", "Ciao", "Olá", "こんにちは", "Hallå", "Guten Tag", "你好"]) {
        if (turn !== generation) return;
        label.textContent = greeting;
        await new Promise(resolve => setTimeout(resolve, greeting === "你好" ? 400 : 150));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 280));
    }
    if (turn !== generation) return;
    releaseOpening();
    const curve = innerWidth > 540 ? "10vh" : "5vh";
    void animate(words, [{ opacity: 1 }, { opacity: 0 }], 450, "linear");
    void animate(bottom, [{ height: curve }, { height: "0vh" }], 850, "cubic-bezier(.76,0,.24,1)", 150);
    const intro = document.querySelector<HTMLElement>(".about-intro, .page-hero-min, .writing-hero");
    if (intro && !location.hash && scrollY < 40) void animate(intro, [{ translate: "0 60px" }, { translate: "0 0" }], 800, "cubic-bezier(.16,1,.3,1)");
    await animate(screen, [{ transform: "translateY(0)" }, { transform: "translateY(-110%)" }], 800, "cubic-bezier(.76,0,.24,1)");
    if (turn !== generation) return;
    reset();
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : document.querySelector<HTMLElement>("main h1");
    if (target && keyboard) {
      const tabIndex = target.getAttribute("tabindex");
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => { if (tabIndex === null) target.removeAttribute("tabindex"); else target.setAttribute("tabindex", tabIndex); }, { once: true });
    }
  };
  curtain.addEventListener("cancel", event => { event.preventDefault(); if (!navigating) reset(true); });
  addEventListener("pageshow", event => {
    if (!event.persisted) return;
    reset();
    if (noMotion()) return;
    label.textContent = (root.lang === "zh-CN" ? root.dataset.pageNameZh : root.dataset.pageNameEn) || "";
    root.dataset.transitionIncoming = "";
    void reveal();
  });
  addEventListener("page-transition-release", () => reset());
  // Never leave an open modal or curtain in the browser's back/forward cache.
  addEventListener("pagehide", () => { generation++; clearTimeout(watchdog); if (curtain.open) curtain.close(); });
  reduced.addEventListener("change", () => { if (reduced.matches && !navigating) reset(true); });
  if (root.hasAttribute("data-transition-incoming") && !noMotion()) void reveal();
  else reset();
}
