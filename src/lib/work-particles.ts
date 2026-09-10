/*
 * VOIDTYPE kinetic particle typography.
 *
 * Interaction model: off-screen text sampling -> Three.js point cloud ->
 * continuous pointer momentum injected into a 10px velocity grid -> pressure
 * propagation -> velocity handoff -> elastic return.
 *
 * The grid solver is an adapted TypeScript implementation of the MIT-licensed
 * fluid-particle model credited in THIRD_PARTY_NOTICES.md. No Newmix visual
 * assets or proprietary source code are included.
 */

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const DPR_CAP = 2;
const CELL_SIZE = 10;
const FORCE_RADIUS = 48;
const PATH_STEP = 6;
const FIELD_PICKUP = 0.06;
const PRESSURE_COUPLING = 0.25;
const FIELD_SPEED_CAP = 100;
const PARTICLE_SPEED_CAP = 30;
const PARTICLE_DAMPING = 0.4;
const RETURN_SPEED_THRESHOLD = 0.5;
const RETURN_RAMP_SECONDS = 0.05;
const RETURN_FORCE = 50;
const RETURN_INITIAL_STRENGTH = 0.15;
const DESKTOP_POINT_SIZE = 1.6;
const MOBILE_POINT_SIZE = 1;
const TEXT_SAMPLE_COVERAGE = 0.7;
const MAX_PARTICLES_DESKTOP = 140_000;
const MAX_PARTICLES_MOBILE = 54_000;

const POINT_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize;
  }
`;

const POINT_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

function themeColor(): Color { return new Color("#fdfdfd"); }

export function setupWorkParticles(root: HTMLElement): void {
  if (root.dataset.particleInitialized === "true") return;

  const canvas = root.querySelector<HTMLCanvasElement>(".wordmark-canvas");
  const source = root.querySelector<HTMLElement>("[data-particle-source]");
  if (!canvas || !source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const row = root.closest<HTMLElement>(".prow");
  const expanded = () => !!row?.classList.contains("is-open") && !row.classList.contains("is-animating");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const motionOff = () => reduced.matches || document.documentElement.hasAttribute("data-reduced") || new URLSearchParams(location.search).get("motion") === "reduce";
  if (motionOff() || !expanded()) return;
  const renderCanvas = canvas;
  const textSource = source;
  root.dataset.particleInitialized = "true";

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas: renderCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return;
  }

  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  let camera = new OrthographicCamera();
  let points: Points<BufferGeometry, ShaderMaterial> | null = null;
  let geometry: BufferGeometry | null = null;
  let material: ShaderMaterial | null = null;

  let width = 1;
  let height = 1;
  let particleCount = 0;
  let positions = new Float32Array(0);
  let homes = new Float32Array(0);
  let particleVelocities = new Float32Array(0);
  let returnStartedAt = new Float64Array(0);

  let cols = 1;
  let rows = 1;
  let fieldX = new Float32Array(1);
  let fieldY = new Float32Array(1);
  let nextFieldX = new Float32Array(1);
  let nextFieldY = new Float32Array(1);
  let pressure = new Float32Array(1);

  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  let pointerX = -9999;
  let pointerY = -9999;
  let previousX = -9999;
  let previousY = -9999;
  let hasPointer = false;
  let animationFrame = 0;
  let lastFrameAt = performance.now();
  let running = false;
  let inView = true;
  let resizeTimer = 0;
  const initialBuildComplete = true;
  let entranceStartedAt = 0;

  const cellIndex = (column: number, row: number): number =>
    Math.min(rows - 1, Math.max(0, row)) * cols + Math.min(cols - 1, Math.max(0, column));

  function resetField(): void {
    cols = Math.ceil(width / CELL_SIZE);
    rows = Math.ceil(height / CELL_SIZE);
    const length = cols * rows;
    fieldX = new Float32Array(length);
    fieldY = new Float32Array(length);
    nextFieldX = new Float32Array(length);
    nextFieldY = new Float32Array(length);
    pressure = new Float32Array(length);
  }

  function sampleText(): Float32Array {
    if (!sampleContext) return new Float32Array(0);

    sampleCanvas.width = width;
    sampleCanvas.height = height;
    sampleContext.clearRect(0, 0, width, height);
    sampleContext.fillStyle = "#fff";
    sampleContext.textAlign = "center";
    sampleContext.textBaseline = "middle";

    const sourceStyle = getComputedStyle(textSource);
    const family = sourceStyle.fontFamily || getComputedStyle(document.body).fontFamily;
    const weight = sourceStyle.fontWeight || "700";
    const lines = Array.from(textSource.querySelectorAll<HTMLElement>("[data-particle-line]"))
      .map((line) => line.textContent?.trim() || "")
      .filter(Boolean);
    if (lines.length === 0) lines.push(textSource.textContent?.trim() || "VOIDTYPE");

    let fontSize = Math.min(height * (lines.length > 1 ? 0.19 : 0.34), width / 4.5, 132);
    sampleContext.font = `${weight} ${fontSize}px ${family}`;
    const measured = Math.max(...lines.map((line) => sampleContext.measureText(line).width));
    if (measured > width * 0.94) {
      fontSize *= (width * 0.94) / measured;
      sampleContext.font = `${weight} ${fontSize}px ${family}`;
    }

    const lineHeight = fontSize * 1.04;
    lines.forEach((line, index) => {
      const y = height / 2 + (index - (lines.length - 1) / 2) * lineHeight;
      sampleContext.fillText(line, width / 2, y);
    });
    const pixels = sampleContext.getImageData(0, 0, width, height).data;
    const mobile = width < 640;
    const cap = mobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP;
    const step = mobile ? Math.max(.55, 1.35 * width / 800) : 1;
    const sampled: number[] = [];

    for (let y = 0; y < height; y += step) {
      const sampleY = Math.floor(y);
      for (let x = 0; x < width; x += step) {
        const sampleX = Math.floor(x);
        const alpha = pixels[(sampleY * width + sampleX) * 4 + 3];
        if (alpha <= 52 || sampled.length / 3 >= cap) continue;

        // Keep a single irregular layer. Deterministic thinning leaves enough
        // black space for the sub-pixel grains to remain individually legible.
        const coverage = mobile ? 0.78 : TEXT_SAMPLE_COVERAGE;
        const sampleHash = ((sampleX * 17 + sampleY * 31) % 100) / 100;
        if (sampleHash >= coverage) continue;
        sampled.push(
          x - width / 2 + (Math.random() - 0.5) * step * 2.4,
          height / 2 - y + (Math.random() - 0.5) * step * 2.4,
          0,
        );
      }
    }

    return new Float32Array(sampled);
  }

  function disposePoints(): void {
    if (points) scene.remove(points);
    geometry?.dispose();
    material?.dispose();
    points = null;
    geometry = null;
    material = null;
  }

  function rebuild(playEntrance: boolean): boolean {
    const sampled = sampleText();
    if (sampled.length === 0) return false;

    particleCount = sampled.length / 3;
    positions = new Float32Array(sampled.length);
    homes = new Float32Array(sampled);
    particleVelocities = new Float32Array(sampled.length);
    returnStartedAt = new Float64Array(particleCount);
    returnStartedAt.fill(-1);
    const grainSizes = new Float32Array(particleCount);
    const grainAlphas = new Float32Array(particleCount);
    entranceStartedAt = performance.now() / 1000;
    const ratio = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const basePointSize =
      width < 640 ? .85 : window.innerWidth <= 1024 ? MOBILE_POINT_SIZE : DESKTOP_POINT_SIZE;

    for (let index = 0; index < particleCount; index++) {
      const offset = index * 3;
      if (playEntrance) {
        const distance = width * (0.34 + Math.random() * 0.36);
        positions[offset] = homes[offset] + distance + (Math.random() - 0.5) * 90;
        positions[offset + 1] = homes[offset + 1] + (Math.random() - 0.5) * height * 0.46;
      } else {
        positions[offset] = homes[offset];
        positions[offset + 1] = homes[offset + 1];
      }
      positions[offset + 2] = 0;
      grainSizes[index] = basePointSize * ratio;
      grainAlphas[index] = 1;
    }

    disposePoints();
    geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new BufferAttribute(grainSizes, 1));
    geometry.setAttribute("aAlpha", new BufferAttribute(grainAlphas, 1));
    material = new ShaderMaterial({
      uniforms: { uColor: { value: themeColor() } },
      vertexShader: POINT_VERTEX_SHADER,
      fragmentShader: POINT_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    });
    points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    root.dataset.particleCount = String(particleCount);
    root.dataset.particleRenderer = "continuous-fluid-grid";
    root.dataset.particleMaterial = "crisp-pixel-grains";
    root.dataset.particlePointSize = String(basePointSize);
    root.dataset.particleOpacity = "1";
    root.dataset.particleCoverage = String(width < 640 ? 0.78 : TEXT_SAMPLE_COVERAGE);
    root.dataset.particleFlowInjectionCount = "0";
    root.dataset.particleFieldRadius = String(FORCE_RADIUS);
    root.dataset.particleDamping = String(PARTICLE_DAMPING);
    root.dataset.particleReturnMode = "source-order-speed-handoff";
    root.dataset.particleReturnThreshold = String(RETURN_SPEED_THRESHOLD);
    root.dataset.particleReturnRamp = String(RETURN_RAMP_SECONDS);
    root.dataset.particleReturnForce = String(RETURN_FORCE);
    root.dataset.particleBuffer = `${renderCanvas.width}x${renderCanvas.height}`;
    root.dataset.particleBuildCount = String(Number(root.dataset.particleBuildCount || 0) + 1);
    return true;
  }

  function updateTheme(): void {
    const color = material?.uniforms.uColor?.value as Color | undefined;
    color?.copy(themeColor());
  }

  function injectPoint(x: number, y: number, deltaX: number, deltaY: number): void {
    const left = Math.max(0, Math.floor((x - FORCE_RADIUS) / CELL_SIZE));
    const right = Math.min(cols - 1, Math.ceil((x + FORCE_RADIUS) / CELL_SIZE));
    const top = Math.max(0, Math.floor((y - FORCE_RADIUS) / CELL_SIZE));
    const bottom = Math.min(rows - 1, Math.ceil((y + FORCE_RADIUS) / CELL_SIZE));

    for (let row = top; row <= bottom; row++) {
      for (let column = left; column <= right; column++) {
        const centerX = column * CELL_SIZE;
        const centerY = row * CELL_SIZE;
        const dx = centerX - x;
        const dy = centerY - y;
        let distance = Math.hypot(dx, dy);
        if (distance >= FORCE_RADIUS) continue;
        distance = Math.max(4, distance);
        const multiplier = FORCE_RADIUS / distance;
        const index = row * cols + column;
        fieldX[index] += deltaX * multiplier;
        fieldY[index] += deltaY * multiplier;
      }
    }
  }

  function injectPath(fromX: number, fromY: number, toX: number, toY: number): void {
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const steps = Math.max(1, Math.ceil(Math.hypot(deltaX, deltaY) / PATH_STEP));
    for (let step = 0; step <= steps; step++) {
      const progress = step / steps;
      injectPoint(fromX + deltaX * progress, fromY + deltaY * progress, deltaX, deltaY);
    }
    root.dataset.particleFlowInjectionCount = String(
      Number(root.dataset.particleFlowInjectionCount || 0) + 1,
    );
    root.dataset.particleLastPointerSpeed = Math.hypot(deltaX, deltaY).toFixed(2);
  }

  function handlePointer(event: PointerEvent | MouseEvent): void {
    if (!expanded() || motionOff()) { resetPointer(); return; }
    const bounds = root.getBoundingClientRect();
    const nextX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * width;
    const nextY = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * height;
    if (nextX < 0 || nextY < 0 || nextX > width || nextY > height) { resetPointer(); return; }

    pointerX = nextX;
    pointerY = nextY;
    if (!hasPointer) {
      previousX = nextX;
      previousY = nextY;
    }
    hasPointer = true;

  }

  function injectPointerFrame(): void {
    if (!hasPointer) return;
    if (pointerX !== previousX || pointerY !== previousY) {
      injectPath(previousX, previousY, pointerX, pointerY);
    }
    previousX = pointerX;
    previousY = pointerY;
  }


  function updateField(time: number): void {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < cols; column++) {
        const index = row * cols + column;
        fieldX[index] += 0.005 * Math.sin(row * CELL_SIZE * 0.005 + time * 0.06);
        fieldY[index] += 0.005 * Math.cos(column * CELL_SIZE * 0.005 - time * 0.066);

        const upperLeft = cellIndex(column - 1, row - 1);
        const left = cellIndex(column - 1, row);
        const lowerLeft = cellIndex(column - 1, row + 1);
        const upperRight = cellIndex(column + 1, row - 1);
        const right = cellIndex(column + 1, row);
        const lowerRight = cellIndex(column + 1, row + 1);
        const up = cellIndex(column, row - 1);
        const down = cellIndex(column, row + 1);

        const horizontal =
          0.5 * fieldX[upperLeft] +
          fieldX[left] +
          0.5 * fieldX[lowerLeft] -
          0.5 * fieldX[upperRight] -
          fieldX[right] -
          0.5 * fieldX[lowerRight];
        const vertical =
          0.5 * fieldY[upperLeft] +
          fieldY[up] +
          0.5 * fieldY[upperRight] -
          0.5 * fieldY[lowerLeft] -
          fieldY[down] -
          0.5 * fieldY[lowerRight];
        pressure[index] = (horizontal + vertical) * PRESSURE_COUPLING;
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < cols; column++) {
        const index = row * cols + column;
        const upperLeft = cellIndex(column - 1, row - 1);
        const left = cellIndex(column - 1, row);
        const lowerLeft = cellIndex(column - 1, row + 1);
        const upperRight = cellIndex(column + 1, row - 1);
        const right = cellIndex(column + 1, row);
        const lowerRight = cellIndex(column + 1, row + 1);
        const up = cellIndex(column, row - 1);
        const down = cellIndex(column, row + 1);

        let velocityX =
          fieldX[index] +
          (0.5 * pressure[upperLeft] + pressure[left] + 0.5 * pressure[lowerLeft] -
            0.5 * pressure[upperRight] - pressure[right] - 0.5 * pressure[lowerRight]) *
            PRESSURE_COUPLING;
        let velocityY =
          fieldY[index] +
          (0.5 * pressure[upperLeft] + pressure[up] + 0.5 * pressure[upperRight] -
            0.5 * pressure[lowerLeft] - pressure[down] - 0.5 * pressure[lowerRight]) *
            PRESSURE_COUPLING;
        const speed = Math.hypot(velocityX, velocityY);
        if (speed > FIELD_SPEED_CAP) {
          velocityX *= FIELD_SPEED_CAP / speed;
          velocityY *= FIELD_SPEED_CAP / speed;
        }
        nextFieldX[index] = velocityX * 0.99;
        nextFieldY[index] = velocityY * 0.99;
      }
    }

    [fieldX, nextFieldX] = [nextFieldX, fieldX];
    [fieldY, nextFieldY] = [nextFieldY, fieldY];
  }

  function updateParticles(time: number, delta: number): void {
    let movingParticles = 0;
    let maximumDisplacement = 0;

    for (let index = 0; index < particleCount; index++) {
      const offset = index * 3;
      const entranceAge = time - entranceStartedAt;
      if (!initialBuildComplete && entranceAge < 1.75) {
        const progress = Math.min(1, Math.max(0, entranceAge / 1.75));
        const eased = 1 - Math.pow(1 - progress, 3);
        const settle = 0.018 + eased * 0.075;
        positions[offset] += (homes[offset] - positions[offset]) * settle;
        positions[offset + 1] += (homes[offset + 1] - positions[offset + 1]) * settle;
        particleVelocities[offset] = 0;
        particleVelocities[offset + 1] = 0;
        continue;
      }

      const screenX = Math.min(width - 1, Math.max(0, positions[offset] + width / 2));
      const screenY = Math.min(height - 1, Math.max(0, height / 2 - positions[offset + 1]));
      const column = Math.min(cols - 1, Math.max(0, Math.floor(screenX / CELL_SIZE)));
      const row = Math.min(rows - 1, Math.max(0, Math.floor(screenY / CELL_SIZE)));
      const index00 = cellIndex(column, row);
      const index10 = cellIndex(column + 1, row);
      const index01 = cellIndex(column, row + 1);
      const fractionX = (screenX % CELL_SIZE) / CELL_SIZE;
      const fractionY = (screenY % CELL_SIZE) / CELL_SIZE;

      let speed = Math.hypot(particleVelocities[offset], particleVelocities[offset + 1]);
      if (speed > RETURN_SPEED_THRESHOLD) {
        returnStartedAt[index] = -1;
      } else if (returnStartedAt[index] < 0) {
        returnStartedAt[index] = time;
      }

      if (returnStartedAt[index] >= 0) {
        const returnAge = Math.min(1, (time - returnStartedAt[index]) / RETURN_RAMP_SECONDS);
        const smoothReturn = returnAge * returnAge * (3 - 2 * returnAge);
        const spring =
          RETURN_FORCE *
          delta *
          (RETURN_INITIAL_STRENGTH + (1 - RETURN_INITIAL_STRENGTH) * smoothReturn);
        particleVelocities[offset] += (homes[offset] - positions[offset]) * spring;
        particleVelocities[offset + 1] += (homes[offset + 1] - positions[offset + 1]) * spring;
      }

      // Match the accepted intermediate version and the official source order:
      // hand off the already-damped velocity first, then read this frame's field.
      particleVelocities[offset] +=
        ((1 - fractionX) * fieldX[index00] +
          fractionX * fieldX[index10] +
          fractionY * fieldX[index01]) *
        FIELD_PICKUP;
      particleVelocities[offset + 1] -=
        ((1 - fractionY) * fieldY[index00] +
          fractionX * fieldY[index10] +
          fractionY * fieldY[index01]) *
        FIELD_PICKUP;

      speed = Math.hypot(particleVelocities[offset], particleVelocities[offset + 1]);
      if (speed > PARTICLE_SPEED_CAP) {
        particleVelocities[offset] *= PARTICLE_SPEED_CAP / speed;
        particleVelocities[offset + 1] *= PARTICLE_SPEED_CAP / speed;
      }

      positions[offset] += particleVelocities[offset];
      positions[offset + 1] += particleVelocities[offset + 1];
      particleVelocities[offset] *= PARTICLE_DAMPING;
      particleVelocities[offset + 1] *= PARTICLE_DAMPING;

      const displacement = Math.hypot(
        positions[offset] - homes[offset],
        positions[offset + 1] - homes[offset + 1],
      );
      if (displacement > 0.5) movingParticles++;
      maximumDisplacement = Math.max(maximumDisplacement, displacement);
    }

    root.dataset.particleMovingCount = String(movingParticles);
    root.dataset.particleMaxDisplacement = maximumDisplacement.toFixed(2);
    const attribute = geometry?.getAttribute("position") as BufferAttribute | undefined;
    if (attribute) attribute.needsUpdate = true;
  }

  function animate(now: number): void {
    if (!running) return;
    const time = now / 1000;
    const delta = Math.min(0.05, Math.max(0.001, (now - lastFrameAt) / 1000));
    lastFrameAt = now;
    injectPointerFrame();
    updateField(time);
    updateParticles(time, delta);
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function start(): void {
    if (running || !inView || document.hidden || motionOff() || !expanded()) return;
    running = true;
    root.dataset.particleRunning = "true";
    lastFrameAt = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }

  function stop(): void {
    running = false;
    root.dataset.particleRunning = "false";
    cancelAnimationFrame(animationFrame);
  }

  function resize(playEntrance = false): void {
    resetPointer();
    if (!expanded() || motionOff()) return;
    width = Math.max(1, Math.round(root.clientWidth));
    height = Math.max(1, Math.round(root.clientHeight));
    if (width < 10 || height < 10) return;

    const ratio = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10);
    camera.position.z = 1;
    resetField();
    if (rebuild(playEntrance)) {
      root.classList.add("is-live");
      if (!playEntrance) entranceStartedAt = -Infinity;
    }
  }

  root.addEventListener("pointerenter", handlePointer);
  root.addEventListener("pointermove", handlePointer);
  root.addEventListener("click", handlePointer);
  const resetPointer = () => {
    hasPointer = false;
    pointerX = pointerY = previousX = previousY = -9999;
  };
  root.addEventListener("pointerleave", resetPointer);
  root.addEventListener("pointercancel", resetPointer);
  // A drag is interaction with the particles, not a request to open/close the project.
  let down: { x: number; y: number } | null = null;
  let dragged = false;
  root.addEventListener("pointerdown", event => { down = { x: event.clientX, y: event.clientY }; dragged = false; });
  root.addEventListener("pointermove", event => { if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) dragged = true; });
  root.addEventListener("pointerup", () => { down = null; });
  root.addEventListener("pointerleave", () => { down = null; });
  root.addEventListener("click", event => { if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; } }, true);

  const resizeObserver = new ResizeObserver(() => {
    if (!initialBuildComplete) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (
        Math.abs(Math.round(root.clientWidth) - width) < 2 &&
        Math.abs(Math.round(root.clientHeight) - height) < 2
      ) {
        return;
      }
      resize(false);
    }, 180);
  });
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? true;
    if (inView) start();
    else stop();
  });
  intersectionObserver.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  window.addEventListener("voidtype:theme", updateTheme);
  renderCanvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
    root.classList.remove("is-live");
  });

  const syncMotion = () => {
    if (motionOff() || !expanded()) { stop(); resetPointer(); window.clearTimeout(resizeTimer); root.classList.remove("is-live"); }
    else { resize(false); start(); }
  };
  if (row) new MutationObserver(syncMotion).observe(row, { attributes: true, attributeFilter: ["class"] });
  reduced.addEventListener("change", syncMotion);
  new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduced"] });
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", start);
  resize(false);
  start();
}
