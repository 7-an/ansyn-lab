/** The same footer motion, clock and magnetic controls on every page. */
export function initSharedFooter() {
  const footer = document.querySelector<HTMLElement>(".about-contact");
  if (!footer) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => motion.matches || document.documentElement.hasAttribute("data-reduced") || new URLSearchParams(location.search).get("motion") === "reduce";
  const arrow = footer.querySelector<HTMLElement>(".about-contact-arrow");
  const contact = footer.querySelector<HTMLElement>(".about-contact-ball");
  let frame = 0;
  const render = () => {
    frame = 0;
    const bounds = footer.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / Math.min(innerHeight, bounds.height)));
    const curveDepth = Math.max(140, Math.min(220, innerHeight * .22));
    footer.style.setProperty("--about-curve", `${reduced() ? 0 : (1 - progress) * curveDepth}px`);
    footer.style.setProperty("--about-footer-drift", `${reduced() ? 0 : (1 - progress) * -65}px`);
    document.body.classList.toggle("about-dark-footer", bounds.top < innerHeight - 40);
    if (arrow && contact) {
      // Measure the unrotated wrapper so aiming does not affect its own origin.
      const origin = arrow.getBoundingClientRect();
      const target = contact.getBoundingClientRect();
      const angle = Math.atan2(target.top + target.height / 2 - origin.top - origin.height / 2, target.left + target.width / 2 - origin.left - origin.width / 2) * 180 / Math.PI;
      arrow.style.setProperty("--contact-arrow-angle", `${angle}deg`);
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  addEventListener("pageshow", schedule);
  motion.addEventListener("change", schedule);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(footer);
    if (arrow?.parentElement) observer.observe(arrow.parentElement);
  }
  render();
  const clock = footer.querySelector<HTMLElement>("[data-about-time]");
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => { const now = new Date(); if (clock) { clock.textContent = formatter.format(now); clock.setAttribute("datetime", now.toISOString()); } };
  tick();
  const timer = setInterval(tick, 30000);
  addEventListener("pagehide", () => clearInterval(timer), { once: true });
  // Reference behavior: an anchored circle grows near the pointer instead of translating.
  if (contact) {
    let feedbackFrame = 0;
    let pointer: { x: number; y: number } | null = null;
    const reset = () => {
      cancelAnimationFrame(feedbackFrame); feedbackFrame = 0; pointer = null;
      contact.style.removeProperty("--contact-scale");
    };
    const paint = () => {
      feedbackFrame = 0;
      if (!pointer || reduced()) return reset();
      const rail = contact.parentElement!.getBoundingClientRect();
      const x = rail.left + contact.offsetLeft + contact.offsetWidth / 2;
      const y = rail.top + rail.height / 2;
      const distance = Math.hypot(pointer.x - x, pointer.y - y);
      const radius = contact.offsetWidth / 2;
      const near = Math.max(0, Math.min(1, 1 - (distance - radius) / 110));
      contact.style.setProperty("--contact-scale", (1 + .07 * near * near * (3 - 2 * near)).toFixed(4));
    };
    footer.addEventListener("pointermove", event => {
      if (reduced() || event.pointerType !== "mouse" || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!feedbackFrame) feedbackFrame = requestAnimationFrame(paint);
    }, { passive: true });
    footer.addEventListener("pointerleave", reset);
    addEventListener("scroll", reset, { passive: true });
    addEventListener("pagehide", reset);
    motion.addEventListener("change", reset);
  }
}
