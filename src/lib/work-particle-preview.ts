/** The closed card stays static; load the real renderer only after expansion. */
export function initWorkParticlePreview() {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll<HTMLElement>("[data-wordmark]").forEach(root => {
    const row = root.closest<HTMLElement>(".prow");
    if (!row) return;
    const expanded = () => row.classList.contains("is-open") && !row.classList.contains("is-animating");
    const motionOff = () => media.matches || document.documentElement.hasAttribute("data-reduced") || new URLSearchParams(location.search).get("motion") === "reduce";
    let loading = false;
    const load = async () => {
      if (loading || root.dataset.particleInitialized === "true" || !expanded() || motionOff()) return;
      loading = true;
      try {
        const { setupWorkParticles } = await import("./work-particles");
        await document.fonts.ready;
        // The card may have closed while the module or font was loading.
        if (expanded() && !motionOff()) setupWorkParticles(root);
      } catch { /* Keep the original project cover if WebGL cannot load. */ }
      finally { loading = false; }
    };
    new MutationObserver(() => { void load(); }).observe(row, { attributes: true, attributeFilter: ["class"] });
    new MutationObserver(() => { void load(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduced"] });
    media.addEventListener("change", () => { void load(); });
    void load();
  });
}
