/** The designer's one-shot letter scan, isolated from globe and navigation state. */
export {};
const root = document.documentElement;
const mediaPreference = matchMedia("(prefers-reduced-motion: reduce)");
const isReduced = () => mediaPreference.matches || root.hasAttribute("data-reduced");
  let heroFrame = 0;
  let signalCanvas: HTMLCanvasElement | undefined;
  function stopHero() { cancelAnimationFrame(heroFrame); heroFrame = 0; signalCanvas?.remove(); signalCanvas = undefined; }
  async function heroScan() {
    const opening = document.querySelector<HTMLElement>('.opening');
    if (!opening || isReduced() || root.hasAttribute('data-opening-intro')) return;
    await document.fonts.ready;
    if (isReduced() || root.hasAttribute('data-opening-intro') || scrollY > 80 || document.visibilityState === 'hidden') return;
    stopHero();
    const width = opening.clientWidth, height = opening.clientHeight;
    if (!width || !height) return;
    const mask = document.createElement('canvas');
    mask.width = width; mask.height = height;
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const letters = [...'ANSYN'];
    ctx.font = '800 100px Poppins, sans-serif';
    const widths = letters.map(letter => ctx.measureText(letter).width);
    const nominalWidth = widths.reduce((sum, w) => sum + w, 0) + 12;
    const size = Math.min(width * .94 / nominalWidth * 100, height * 1.05);
    ctx.font = `800 ${size}px Poppins, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    let x = (width - nominalWidth * size / 100) / 2;
    letters.forEach((letter, index) => {
      const w = widths[index] * size / 100;
      ctx.save();
      ctx.translate(x + w / 2, height / 2 + [-.02, .21, 0, .13, -.03][index] * size);
      ctx.rotate([-2, 1.5, -1.2, 1.8, -1.5][index] * Math.PI / 180);
      ctx.fillText(letter, -w / 2, 0);
      ctx.restore();
      x += w + .03 * size;
    });
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const step = width < 760 ? 16 : 22;
    const points: [number, number][] = [];
    for (let y = 12; y < height - 12; y += step) for (let px = 12; px < width - 12; px += step) {
      if (pixels[(Math.floor(y) * width + Math.floor(px)) * 4 + 3] > 160 && ((px + y * 3) % 7 < 3)) points.push([px, y]);
    }
    signalCanvas = document.createElement('canvas');
    signalCanvas.className = 'hero-signal';
    signalCanvas.setAttribute('aria-hidden', 'true');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    signalCanvas.width = Math.round(width * dpr); signalCanvas.height = Math.round(height * dpr);
    opening.append(signalCanvas);
    const draw = signalCanvas.getContext('2d');
    if (!draw) return stopHero();
    draw.scale(dpr, dpr);
    let start: number | undefined;
    const frame = (time: number) => {
      if (isReduced() || scrollY > 100 || !signalCanvas) return stopHero();
      if (!start) start = time;
      const progress = (time - start) / 1700;
      if (progress >= 1) return stopHero();
      draw.clearRect(0, 0, width, height);
      const head = (progress * 1.4 - .15) * width;
      const band = width * .22;
      points.forEach(([px, y]) => {
        const distance = (head - px) / band;
        if (distance < 0 || distance > 1) return;
        const fade = Math.sin(distance * Math.PI);
        draw.globalAlpha = fade * .84;
        draw.fillStyle = '#3164ff';
        const w = 3 + 20 * Math.sin(distance * Math.PI);
        draw.beginPath();
        draw.roundRect(px - w / 2, y - 1.8, w, 3.6, 2);
        draw.fill();
      });
      heroFrame = requestAnimationFrame(frame);
    }
    heroFrame = requestAnimationFrame(frame);
  }
  void heroScan();
  addEventListener('site:opening-reveal', () => { void heroScan(); });
  addEventListener('resize', stopHero, { passive: true });
  addEventListener('pagehide', stopHero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopHero(); });
  mediaPreference.addEventListener("change", stopHero);
