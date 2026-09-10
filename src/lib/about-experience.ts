/** Native, page-scoped equivalents of the reference's parallax, magnetic controls and curved footer. */
export function initAboutExperience() {
  const page = document.querySelector<HTMLElement>(".about-page");
  if (!page) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => motion.matches || document.documentElement.hasAttribute("data-reduced") || new URLSearchParams(location.search).get("motion") === "reduce";
  const light = page.querySelector<HTMLElement>(".about-light");
  const practices = page.querySelector<HTMLElement>(".about-practices");
  const photo = page.querySelector<HTMLElement>(".about-photo-section");
  const arrow = page.querySelector<HTMLElement>(".about-arrow");
  const spark = page.querySelector<HTMLElement>(".about-spark");
  const images = [...page.querySelectorAll<HTMLElement>("[data-about-image]")];
  const drift = page.querySelector<HTMLElement>("[data-about-drift]");
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  let scheduled = false;
  const render = () => {
    scheduled = false;
    const height = innerHeight;
    const noMotion = reduced();
    if (light && practices) {
      const box = practices.getBoundingClientRect();
      const progress = clamp((height - box.top + box.height * .25) / (box.height * 1.25));
      const channel = Math.round(253 - 13 * (noMotion ? 1 : progress));
      light.style.setProperty("--about-surface", `rgb(${channel},${channel},${channel})`);
      if (spark) spark.style.transform = noMotion ? "none" : `rotate(${progress * 90}deg)`;
    }
    for (const image of images) {
      const bounds = image.parentElement!.getBoundingClientRect();
      const progress = clamp((height - bounds.top) / (height + bounds.height));
      image.style.transform = noMotion ? "none" : `translateY(${(progress - .5) * bounds.height * .12}px)`;
    }
    if (photo) {
      const bounds = photo.getBoundingClientRect();
      const progress = clamp((height - bounds.top) / (height + bounds.height));
      if (arrow) arrow.style.transform = `rotate(${45 + (noMotion ? 0 : progress * 60)}deg)`;
      if (drift) drift.style.transform = noMotion ? "none" : `translateY(${progress * 45}px)`;
    }

  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  motion.addEventListener("change", schedule);
  render();
}
