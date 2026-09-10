import type Lenis from "lenis";
/* A single scroll owner. Wheel input stays interruptible; only chapter edges settle. */
export function pickScreenStop(position: number, stops: number[], height: number, direction = 0) {
  const reach = Math.min(160, Math.max(90, height * .17));
  const overshoot = Math.min(56, reach * .4);
  return stops
    .map(top => ({ top, delta: top - position }))
    .filter(({ delta }) => Math.abs(delta) > 2 && Math.abs(delta) <= reach)
    .filter(({ delta }) => !direction || delta * direction >= -overshoot)
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0]?.top ?? null;
}

if (typeof window !== 'undefined') {
  const root = document.documentElement;
  const desktop = matchMedia('(min-width: 900px) and (min-height: 620px) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let engine: Lenis | undefined;
  let frame = 0, timer = 0, generation = 0;
  let direction = 0, lastWheel = 0, eligible = false, settling = false, dragging = false;
  const disabled = () => !desktop.matches || reduced.matches || root.hasAttribute('data-reduced') || new URLSearchParams(location.search).get('motion') === 'reduce';
  const blocked = () => document.hidden || dragging || !!document.querySelector('dialog[open],.stage.gallery-open') || root.hasAttribute('data-page-transitioning');
  const clearSettle = () => {
    clearTimeout(timer);
    if (settling && engine) engine.scrollTo(engine.animatedScroll, { immediate: true });
    settling = false;
    root.removeAttribute('data-screen-settling');
  };
  function chapterStops() {
    const limit = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    return [...new Set([0, ...[...document.querySelectorAll<HTMLElement>('[data-screen-stop]')]
      .filter(element => element.getClientRects().length && !element.closest('[hidden]'))
      .map(element => Math.min(limit, Math.max(0, Math.round(element.getBoundingClientRect().top + scrollY))))])];
  }
  function settle() {
    if (!engine || !eligible || disabled() || blocked() || settling) return;
    if (performance.now() - lastWheel < 150 || Math.abs(engine.velocity) > .6) {
      timer = window.setTimeout(settle, 100);
      return;
    }
    eligible = false;
    const target = pickScreenStop(scrollY, chapterStops(), innerHeight, direction);
    if (target === null) return;
    settling = true;
    root.setAttribute('data-screen-settling', '');
    engine.scrollTo(target, {
      duration: .68,
      easing: t => 1 - Math.pow(1 - t, 4),
      lock: false,
      onComplete: () => { settling = false; root.removeAttribute('data-screen-settling'); },
    });
  }
  function destroy() {
    clearSettle();
    cancelAnimationFrame(frame);
    engine?.destroy();
    engine = undefined;
    eligible = false;
    root.removeAttribute('data-screen-scroll');
  }
  async function sync() {
    const version = ++generation;
    if (disabled()) return destroy();
    if (engine) return;
    const { default: Lenis } = await import("lenis");
    if (version !== generation || disabled()) return;
    engine = new Lenis({ lerp: .095, anchors: false, smoothWheel: true, syncTouch: false });
    root.setAttribute('data-screen-scroll', 'soft');
    const animate = (time: number) => { if (!engine) return; engine.raf(time); frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    engine.on('scroll', () => {
      if (!engine || !eligible || settling) return;
      clearTimeout(timer);
      timer = window.setTimeout(settle, Math.abs(engine.velocity) < .6 ? 80 : 160);
    });
  }
  // Prevent native hash jumps from racing the smooth controller (Lenis anchors
  // observes clicks but does not cancel the browser's default fragment action).
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || link.target || link.hasAttribute("download") || link.closest("dialog")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target: HTMLElement | null;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    eligible = false; clearSettle();
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    if (engine) engine.scrollTo(target);
    else target.scrollIntoView({ behavior: reduced.matches || root.hasAttribute("data-reduced") ? "instant" : "smooth" });
  });
  window.addEventListener('wheel', event => {
    if (!engine || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    clearSettle();
    const target = event.target instanceof Element ? event.target : null;
    eligible = !blocked() && !target?.closest('[data-lenis-prevent],select,textarea,input,[contenteditable="true"]');
    direction = Math.sign(event.deltaY);
    lastWheel = performance.now();
    if (eligible) timer = window.setTimeout(settle, 180);
  }, { passive: true, capture: true });
  window.addEventListener('pointerdown', () => { dragging = true; eligible = false; clearSettle(); }, { passive: true });
  window.addEventListener('pointerup', () => { dragging = false; }, { passive: true });
  window.addEventListener('pointercancel', () => { dragging = false; }, { passive: true });
  window.addEventListener('keydown', () => { eligible = false; clearSettle(); }, { capture: true });
  window.addEventListener('resize', () => { eligible = false; clearSettle(); }, { passive: true });
  window.addEventListener('pagehide', () => { generation++; destroy(); });
  window.addEventListener('pageshow', () => { void sync().catch(destroy); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { eligible = false; clearSettle(); } });
  desktop.addEventListener('change', () => { void sync().catch(destroy); });
  reduced.addEventListener('change', () => { void sync().catch(destroy); });
  new MutationObserver(() => { void sync().catch(destroy); }).observe(root, { attributes: true, attributeFilter: ['data-reduced'] });
  void sync().catch(destroy);
  // A deep link must land after the home canvas has established its sticky height.
  // Ordinary reload positions, long article anchors and mobile reading stay native.
  async function alignInitialChapter() {
    if (!location.hash || !desktop.matches) return;
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    let anchor: HTMLElement | null;
    try { anchor = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    const chapter = anchor?.closest('[data-screen-stop]');
    if (!chapter || eligible || dragging) return;
    const top = chapter.getBoundingClientRect().top + scrollY;
    if (engine) engine.scrollTo(top, { immediate: true });
    else window.scrollTo({ top, behavior: 'instant' });
  }
  if (document.readyState === 'complete') alignInitialChapter();
  else window.addEventListener('load', alignInitialChapter, { once: true });
}
