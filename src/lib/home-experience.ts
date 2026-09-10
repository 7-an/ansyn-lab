import { globeLocations } from "../config/globe-locations";
import { createOriginalHeroField } from "./original-hero-field";
import { projectGlobe, unprojectGlobe, INITIAL_TILT, createGlobeProjection, prepareGlobePolygons, coastStep } from "./globe-projection";
import { geoPath } from "d3-geo";
import type { Polygon, MultiPolygon, LineString } from "geojson";
type GeoFeature = { geometry: Polygon | MultiPolygon };
const journey = document.querySelector<HTMLElement>("[data-journey]")!;
const stage = document.querySelector<HTMLElement>("[data-stage]")!;
const opening = document.querySelector<HTMLElement>("[data-opening]")!;
const field = document.querySelector<HTMLCanvasElement>("[data-field]")!;
const earth = document.querySelector<HTMLCanvasElement>("[data-earth]")!;
const globeInput = document.querySelector<HTMLElement>("[data-globe-input]")!;
const copy = document.querySelector<HTMLElement>("[data-world-copy]")!;
const words = [...document.querySelectorAll<HTMLElement>(".hero-word")];
const identityName = document.querySelector<HTMLElement>("[data-identity-name]")!;
const heroField = createOriginalHeroField(opening, field, identityName);
const latitudeOutput = document.querySelector<HTMLElement>("[data-hover-lat]")!;
const longitudeOutput = document.querySelector<HTMLElement>("[data-hover-lon]")!;
const mapStatus = document.querySelector<HTMLElement>("[data-map-status]")!;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const motion = { get matches() { return motionPreference.matches || new URLSearchParams(location.search).get("motion") === "reduce"; } };
const globe = earth.getContext("2d");
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const range = (n: number, a: number, b: number) => smooth((n - a) / (b - a));
let canvasTop = 0;
let width = 0, height = 0, ratio = 1, progress = 0, fieldExit = 0;
let longitude = -105, tilt = INITIAL_TILT, paused = false;
let drag = false, pointerX = 0, pointerY = 0, dragDistance = 0;
let velocityLon = 0, velocityTilt = 0, pointerTime = 0, autoDirection = 1;
let activePointer: number | null = null;
let hover: {x:number;y:number} | null = null;
let lastHovered: {lat:number;lon:number} | null = null;
let lastClicked: {lat:number;lon:number} | null = null;
let selectedPlace = -1, photoIndex = 0;
let focusTarget: {longitude:number;tilt:number} | null = null;
const pins = [...document.querySelectorAll<HTMLButtonElement>("[data-pin]")];
const locationButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-location]")];
const gallery = document.querySelector<HTMLElement>("[data-gallery]")!;
const intro = document.querySelector<HTMLElement>("[data-world-intro]")!;
const galleryClose = document.querySelector<HTMLButtonElement>("[data-gallery-close]")!;
const photoFront = document.querySelector<HTMLElement>("[data-photo-front]")!;
const galleryImage = document.querySelector<HTMLImageElement>("[data-gallery-image]")!;
const photoPlaceholder = document.querySelector<HTMLElement>("[data-photo-placeholder]")!;
let galleryAnimation: Animation | null = null, galleryGeneration = 0;
let returnFocus: HTMLElement | null = null;
let pinPositions: {x:number;y:number;z:number}[] = [];
let land: Polygon[] = [];
const mapProjection = createGlobeProjection();
const mapPath = geoPath(mapProjection, globe);
const grid: {geometry:LineString; alpha:number}[] = [];
for (let lat = -75; lat <= 75; lat += 15) {
  grid.push({geometry:{type:"LineString",coordinates:Array.from({length:361},(_,i)=>[i-180,lat])},alpha:lat === 0 ? .75 : .45});
}
for (let lon = -180; lon < 180; lon += 15) {
  grid.push({geometry:{type:"LineString",coordinates:Array.from({length:181},(_,i)=>[lon,i-90])},alpha:lon % 45 === 0 ? .7 : .4});
}
let raf = 0, previous = 0, dirty = true, visible = true;


function resize() {
  width = stage.clientWidth;
  canvasTop = earth.offsetTop;
  height = motion.matches ? earth.clientHeight : stage.clientHeight;
  ratio = Math.min(devicePixelRatio || 1, 2);
  for (const canvas of [earth]) {
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  heroField.resize(); document.documentElement.classList.add("has-field"); dirty = true; start();
}

function globeGeometry() {
  const enter = motion.matches ? 1 : range(progress, .12, .82);
  const mobile = width < 600, compact = width < 1100;
  const endR = Math.min(width * (mobile ? .44 : compact ? .265 : .26), height * (mobile ? .245 : compact ? .32 : .365));
  const centerY = mobile ? (motion.matches ? .49 : .475) : compact ? .47 : .485;
  const settledR = width < 600 && motion.matches ? endR * .84 : endR;
  const radius = settledR + (Math.min(width * .85, height * .94) - settledR) * (1 - enter);
  return {r:radius, x:width / 2, y:height * centerY + (1 - enter) * height * 1.3, enter};
}

function drawGlobe() {
  if (!globe) return;
  globe.clearRect(0, 0, width, height);
  const {r, x: cx, y: cy, enter} = globeGeometry();
  if (enter === 0) return;
  const project = (lat: number, lon: number) => {
    const p = projectGlobe(lat, lon, longitude, tilt);
    return {x:cx + p.x * r, y:cy - p.y * r, z:p.z};
  };
  globe.save();
  globe.globalAlpha = range(enter, 0, .25);
  globe.beginPath(); globe.arc(cx, cy, r, 0, Math.PI * 2); globe.fillStyle = "#fdfdfd"; globe.fill();
  globe.clip();
  mapProjection.rotate([longitude, -tilt * 180 / Math.PI, 0]).scale(r).translate([cx, cy]);
  globe.fillStyle = "#dddddd"; globe.strokeStyle = "#909090"; globe.lineWidth = .8;
  for (const polygon of land) {
    globe.beginPath(); mapPath(polygon); globe.fill(); globe.stroke();
  }
  globe.lineWidth = 1; globe.strokeStyle = "#909090";
  for (const line of grid) {
    globe.globalAlpha = range(enter, 0, .25) * line.alpha;
    globe.beginPath(); mapPath(line.geometry); globe.stroke();
  }
  globe.restore();
  // Outline is painted last so neither land nor clipping can soften its inner half.
  globe.save();
  globe.globalAlpha = range(enter, 0, .25);
  globe.strokeStyle = "#909090"; globe.lineWidth = 1;
  globe.beginPath(); globe.arc(cx, cy, r, 0, Math.PI * 2); globe.stroke();
  // Two short registration corners frame the globe, without intercepting pointers.
  globe.globalAlpha = range(enter, .85, 1);
  const edge = r * 1.04, corner = width < 600 ? 7 : 9;
  globe.beginPath();
  globe.moveTo(cx + edge - corner, cy - edge);
  globe.lineTo(cx + edge, cy - edge);
  globe.lineTo(cx + edge, cy - edge + corner);
  globe.moveTo(cx - edge, cy + edge - corner);
  globe.lineTo(cx - edge, cy + edge);
  globe.lineTo(cx - edge + corner, cy + edge);
  globe.stroke(); globe.restore();
  pinPositions = globeLocations.map((place, i) => {
    const p = project(place.lat, place.lon);
    // Red dots stay at their geographic positions; only their text labels are offset.
    const target = p;
    const shown = enter > .97 && p.z >= 0;
    pins[i].style.left=`${target.x}px`; pins[i].style.top=`${target.y}px`;
    pins[i].style.visibility=shown ? "visible" : "hidden";
    pins[i].style.pointerEvents=shown ? "auto" : "none";
    pins[i].tabIndex=shown ? 0 : -1;
    return target;
  });
}

function updateReadout() {
  const geometry = globeGeometry();
  const rect = earth.getBoundingClientRect();
  const coords = hover && geometry.enter > .9 ? unprojectGlobe(
    (hover.x - rect.left - geometry.x) / geometry.r,
    -(hover.y - rect.top - geometry.y) / geometry.r, longitude, tilt
  ) : null;
  if (coords) lastHovered = coords;
  const displayed = coords ?? lastClicked ?? lastHovered;
  latitudeOutput.textContent = displayed ? `${Math.abs(displayed.lat).toFixed(4)}° ${displayed.lat >= 0 ? "N" : "S"}` : "—";
  longitudeOutput.textContent = displayed ? `${Math.abs(displayed.lon).toFixed(4)}° ${displayed.lon >= 0 ? "E" : "W"}` : "—";
}

function updateScene() {
  progress = motion.matches ? 1 : clamp(-journey.getBoundingClientRect().top / (journey.offsetHeight - stage.offsetHeight));
  fieldExit = motion.matches ? 0 : range(progress, .03, .57);
  // Hand the name over only as the canvas letters finish arriving at the brand position.
  identityName.style.opacity = String(motion.matches ? 1 : range(fieldExit, .9, 1));
  const worldOpacity = motion.matches ? 1 : range(progress, .55, .9);
  copy.style.opacity = String(worldOpacity);
  copy.style.pointerEvents = "none";
  copy.inert = worldOpacity < .9;
  // Only controls intercept pointers; the middle remains a draggable globe.
  copy.querySelectorAll<HTMLElement>("a,button").forEach(e => e.style.pointerEvents = worldOpacity > .9 ? "auto" : "none");
  // Enable the visible globe as it settles, independently of the later copy fade.
  const bounds = globeGeometry(), globeReady = bounds.enter > .9;
  globeInput.style.left = `${bounds.x-bounds.r}px`;
  globeInput.style.top = `${canvasTop+bounds.y-bounds.r}px`;
  globeInput.style.width = `${bounds.r*2}px`;
  globeInput.style.height = `${bounds.r*2}px`;
  globeInput.style.pointerEvents = globeReady ? "auto" : "none";
  globeInput.tabIndex = globeReady ? 0 : -1;
  globeInput.style.cursor = drag ? "grabbing" : "grab";
  for (let i = 0; i < words.length; i++) {
    const leave = motion.matches ? 0 : range(progress, .025 + i * .025, .4 + i * .035);
    words[i].style.transform = `translate3d(0, ${-leave * height * (.3 + i * .05)}px, 0)`;
    words[i].style.opacity = String(1 - leave);
  }
  const meta = opening.querySelector<HTMLElement>(".hero-meta")!;
  meta.style.opacity = String(motion.matches ? 1 : 1 - range(progress,.08,.3));
  opening.style.setProperty("--hero-fade", meta.style.opacity);
  meta.inert = !motion.matches && progress > .3;
  opening.querySelector<HTMLElement>(".hero-clock")!.style.opacity = meta.style.opacity;
}

function frame(now: number) {
  raf = 0;
  if (!visible || document.hidden || (!dirty && motion.matches && !focusTarget)) return;
  const elapsed = Math.min(50, now - (previous || now));
  previous = now;
  updateScene();
  if (focusTarget) {
    const amount=motion.matches ? 1 : 1-Math.exp(-elapsed/140);
    longitude+=(focusTarget.longitude-longitude)*amount; tilt+=(focusTarget.tilt-tilt)*amount;
    if (Math.abs(focusTarget.longitude-longitude)<.02 && Math.abs(focusTarget.tilt-tilt)<.001) {longitude=focusTarget.longitude;tilt=focusTarget.tilt;focusTarget=null;}
  }
  if (!focusTarget && !drag && !motion.matches && progress > .5) {
    const horizontal = coastStep(velocityLon, elapsed), vertical = coastStep(velocityTilt, elapsed);
    longitude += horizontal.distance;
    tilt = clamp(tilt + vertical.distance, -1.2, 1.2);
    velocityLon = Math.abs(horizontal.velocity) < .0001 ? 0 : horizontal.velocity;
    velocityTilt = Math.abs(vertical.velocity) < .000001 || Math.abs(tilt) >= 1.2 ? 0 : vertical.velocity;
    if (!paused && gallery.hidden) longitude += elapsed * .0025 * autoDirection;
  }
  heroField.draw(now, fieldExit, motion.matches); drawGlobe(); updateReadout(); dirty = false;
  if (!motion.matches || focusTarget) start();
}
function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
function stop() { cancelAnimationFrame(raf); raf = 0; previous = 0; }

globeInput.style.touchAction = "pan-y";
function coordinatesAt(clientX: number, clientY: number) {
  const rect = earth.getBoundingClientRect(), g = globeGeometry();
  return unprojectGlobe((clientX-rect.left-g.x)/g.r, -(clientY-rect.top-g.y)/g.r, longitude, tilt);
}
globeInput.addEventListener("pointerdown", e => {
  if (!e.isPrimary || e.button !== 0 || activePointer !== null) return;
  hover = {x:e.clientX,y:e.clientY};
  const clicked = coordinatesAt(e.clientX,e.clientY);
  if (!clicked) return;
  // A drag begins with a deliberate point too, including touch and pen input.
  lastClicked=clicked; lastHovered=clicked;
  focusTarget=null; velocityLon=0; velocityTilt=0;
  dragDistance=0; drag=true; activePointer=e.pointerId;
  pointerX=e.clientX; pointerY=e.clientY; pointerTime=e.timeStamp;
  globeInput.setPointerCapture(e.pointerId); dirty=true; start();
});
globeInput.addEventListener("pointermove", e => {
  if (activePointer !== null && activePointer !== e.pointerId) return;
  hover={x:e.clientX,y:e.clientY};
  if (drag && !coordinatesAt(e.clientX,e.clientY)) {
    // Capture guarantees release delivery, but must never extend the drag area.
    finishDrag(e); hover=null;
    return;
  }
  if (drag) {
    const dx=e.clientX-pointerX, dy=e.clientY-pointerY;
    const dt=clamp(e.timeStamp-pointerTime, 4, 50);
    dragDistance+=Math.abs(dx)+Math.abs(dy);
    const turn=dx*.22, pitch=e.pointerType === "mouse" ? dy*.0025 : 0;
    longitude+=turn; tilt=clamp(tilt+pitch,-1.2,1.2);
    if (dx !== 0 || dy !== 0) {
      velocityLon=velocityLon*.45+clamp(turn/dt,-.18,.18)*.55;
      velocityTilt=velocityTilt*.45+clamp(pitch/dt,-.002,.002)*.55;
      pointerTime=e.timeStamp;
    }
    if (Math.abs(dx)>.5) autoDirection=dx>0 ? 1 : -1;
    pointerX=e.clientX; pointerY=e.clientY;
  }
  dirty=true; start();
});
function finishDrag(e: PointerEvent, cancelled = false) {
  if (e.pointerId !== activePointer) return;
  if (!cancelled && dragDistance < 6) lastClicked=coordinatesAt(e.clientX,e.clientY) ?? lastClicked;
  // A brief pause eases the release velocity down instead of an abrupt cutoff.
  const releaseDecay = Math.exp(-Math.max(0,e.timeStamp-pointerTime-40)/160);
  velocityLon*=releaseDecay; velocityTilt*=releaseDecay;
  if (cancelled || motion.matches || dragDistance < 6) {velocityLon=0;velocityTilt=0;}
  drag=false; activePointer=null;
  if (e.pointerType !== "mouse" || cancelled) hover=null;
  if (globeInput.hasPointerCapture(e.pointerId)) globeInput.releasePointerCapture(e.pointerId);
  dirty=true; start();
}
globeInput.addEventListener("pointerup", e => finishDrag(e));
globeInput.addEventListener("pointercancel", e => finishDrag(e,true));
globeInput.addEventListener("lostpointercapture", e => {if (activePointer === e.pointerId) finishDrag(e,true);});
globeInput.addEventListener("pointerleave", e => {
  if (drag) finishDrag(e);
  hover=null;dirty=true;start();
});
window.addEventListener("blur", () => {
  const pointer=activePointer; activePointer=null; drag=false; hover=null;
  if (pointer !== null) {velocityLon=0;velocityTilt=0;}
  if (pointer !== null && globeInput.hasPointerCapture(pointer)) globeInput.releasePointerCapture(pointer);
  dirty=true;start();
});
globeInput.addEventListener("focus", () => {
  if (hover) return;
  const rect=earth.getBoundingClientRect(), g=globeGeometry();
  hover={x:rect.left+g.x,y:rect.top+g.y}; dirty=true; start();
});
globeInput.addEventListener("blur", () => { paused=false; hover=null; dirty=true; start(); });
globeInput.addEventListener("keydown", e => {
  if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;
  e.preventDefault(); paused=true; velocityLon=0;velocityTilt=0;
  const rect=earth.getBoundingClientRect(), g=globeGeometry();
  hover={x:rect.left+g.x,y:rect.top+g.y};
  if (e.key==="ArrowLeft") longitude-=3;
  if (e.key==="ArrowRight") longitude+=3;
  if (e.key==="ArrowUp") tilt=clamp(tilt-.05,-1.2,1.2);
  if (e.key==="ArrowDown") tilt=clamp(tilt+.05,-1.2,1.2);
  dirty=true; start();
});
window.addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse" || drag) return;
  const target = e.target;
  if (target instanceof Element && target.closest("button,a,[data-gallery]")) return;
  hover = {x:e.clientX,y:e.clientY}; dirty=true; start();
}, {passive:true});
document.documentElement.addEventListener("pointerleave", () => {hover=null;dirty=true;start();});
window.addEventListener("scroll", () => { dirty = true; start(); }, {passive:true});
let resizeTimer = 0;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize,100); });
motionPreference.addEventListener("change", () => { document.documentElement.toggleAttribute("data-reduced", motion.matches); resize(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else {dirty = true; start();} });
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) {dirty = true; start();} else stop(); }).observe(journey);

function updateClock() {
  document.querySelector<HTMLElement>("[data-world-clock]")!.textContent = new Date().toLocaleTimeString("en-GB",{timeZone:globeLocations[Math.max(0,selectedPlace)].timeZone,hour12:false}); document.querySelector<HTMLElement>("[data-hero-clock]")!.textContent = `LOCAL ${new Date().toLocaleTimeString("en-GB", {hour12:false,hour:"2-digit",minute:"2-digit"})}`; }
updateClock(); window.setInterval(() => { if (!document.hidden) updateClock(); },1000);
fetch("/data/countries.json").then(r => {if (!r.ok) throw new Error("Map unavailable"); return r.json();}).then((data: {features:GeoFeature[]}) => {
  land = data.features.flatMap(f => prepareGlobePolygons(f.geometry));
  dirty = true; start();
}).catch(() => { mapStatus.hidden = false; mapStatus.textContent = "Map outlines could not load. Showing the coordinate grid."; });

function renderPhoto(direction = 0) {
  const place = globeLocations[selectedPlace];
  const count = place.photos.length;
  photoIndex = count ? (photoIndex + count) % count : 0;
  gallery.classList.toggle("is-empty", count === 0);
  gallery.classList.toggle("is-single", count === 1);
  gallery.querySelector<HTMLElement>("[data-photo-footer]")!.hidden = count === 0;
  gallery.querySelector<HTMLElement>("[data-photo-controls]")!.hidden = count < 2;
  const photo = place.photos[photoIndex];
  galleryImage.hidden = !photo; photoPlaceholder.hidden = !!photo;
  if (photo) {
    galleryImage.src=photo.src; galleryImage.alt=photo.alt;
    galleryImage.width=photo.width; galleryImage.height=photo.height;
    gallery.querySelector<HTMLElement>("[data-photo-deck]")!.style.aspectRatio=`${photo.width} / ${photo.height}`;
  }
  else { galleryImage.removeAttribute("src"); galleryImage.alt=""; }
  document.querySelector<HTMLElement>("[data-photo-city]")!.textContent=place.english.toUpperCase();
  document.querySelector<HTMLElement>("[data-place-coordinates]")!.textContent=`${place.lat.toFixed(4)}° N / ${place.lon.toFixed(4)}° E`;
  document.querySelector<HTMLElement>("[data-photo-count]")!.textContent=`${String(photoIndex+1).padStart(2,"0")} / ${String(count).padStart(2,"0")}`;
  photoFront.getAnimations().forEach(a=>a.cancel());
  if (!motion.matches && direction && count > 0) photoFront.animate([
    {transform:`translateX(${direction*38}px) rotate(${direction*7}deg)`,opacity:0},
    {transform:"translateX(0) rotate(-1deg)",opacity:1}
  ],{duration:420,easing:"cubic-bezier(.22,1,.36,1)"});
}

function openPlace(index:number, trigger:HTMLElement) {
  const alreadyOpen=!gallery.hidden;
  const place=globeLocations[index];
  const from=pinPositions[index];
  const rect=earth.getBoundingClientRect();
  const source=from && from.z>=0 ? {x:rect.left+from.x,y:rect.top+from.y} : {x:trigger.getBoundingClientRect().left,y:trigger.getBoundingClientRect().top};
  velocityLon=0;velocityTilt=0;
  selectedPlace=index; photoIndex=0; hover=null; lastClicked={lat:place.lat,lon:place.lon}; returnFocus=trigger;
  const target=longitude+((( -place.lon-longitude+180)%360+360)%360)-180;
  focusTarget={longitude:target,tilt:INITIAL_TILT};
  document.querySelector<HTMLElement>("[data-gallery-title]")!.textContent=place.name;
  document.querySelector<HTMLElement>("[data-gallery-english]")!.textContent=place.english;
  pins.forEach((pin,i)=>pin.setAttribute("aria-expanded",String(i===index)));
  locationButtons.forEach(button=>button.setAttribute("aria-pressed",String(Number(button.dataset.location)===index)));
  intro.hidden=true; gallery.hidden=false; stage.classList.add("gallery-open");
  galleryGeneration++; galleryAnimation?.cancel(); galleryAnimation=null;
  renderPhoto(alreadyOpen ? 1 : 0);
  if (!motion.matches && !alreadyOpen) {
    const destination=gallery.getBoundingClientRect();
    galleryAnimation=gallery.animate([
      {transform:`translate(${source.x-destination.left}px,${source.y-destination.top}px) scale(.03)`,opacity:0},
      {transform:"translate(0,0) scale(1)",opacity:1}
    ],{duration:620,easing:"cubic-bezier(.22,1,.36,1)"});
    const deck=gallery.querySelector<HTMLElement>(".photo-deck")!;
    deck.animate([{transform:"rotate(7deg) scale(.93)"},{transform:"rotate(0) scale(1)"}],{duration:750,easing:"cubic-bezier(.22,1,.36,1)"});
  }
  if (!alreadyOpen && trigger.matches(":focus-visible")) galleryClose.focus({preventScroll:true});
  dirty=true;start();updateClock();
}

function closeGallery() {
  if(gallery.hidden)return;
  const generation=++galleryGeneration;
  galleryAnimation?.cancel();
  const finish=()=>{
    if(generation!==galleryGeneration)return;
    gallery.hidden=true; intro.hidden=false; stage.classList.remove("gallery-open");
    pins.forEach(pin=>pin.setAttribute("aria-expanded","false"));
    const focus=returnFocus;
    if(focus && focus.getClientRects().length && getComputedStyle(focus).visibility!=="hidden")focus.focus({preventScroll:true});
    else locationButtons[selectedPlace]?.focus({preventScroll:true});
    hover=null; dirty=true;start();
  };
  if(motion.matches){finish();return;}
  galleryAnimation=gallery.animate([{opacity:1,transform:"translateY(0) scale(1)"},{opacity:0,transform:"translateY(15px) scale(.95)"}],{duration:180,easing:"ease-in",fill:"forwards"});
  galleryAnimation.finished.then(finish).catch(()=>{});
}

pins.forEach((pin,i)=>{
  pin.addEventListener("click",()=>openPlace(i,pin));
  pin.addEventListener("pointerenter",()=>{hover=null;dirty=true;start();});
});
locationButtons.forEach(button=>button.addEventListener("click",()=>openPlace(Number(button.dataset.location),button)));
galleryClose.addEventListener("click",closeGallery);
document.querySelector("[data-photo-next]")!.addEventListener("click",()=>{photoIndex++;renderPhoto(1);});
document.querySelector("[data-photo-prev]")!.addEventListener("click",()=>{photoIndex--;renderPhoto(-1);});
gallery.addEventListener("keydown",e=>{
  if(e.key==="Escape"){e.preventDefault();closeGallery();}
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const direction=e.key==="ArrowRight"?1:-1;photoIndex+=direction;renderPhoto(direction);}
});
gallery.addEventListener("pointerenter",()=>{hover=null;dirty=true;start();});

document.documentElement.toggleAttribute("data-reduced", motion.matches);
document.documentElement.classList.add("motion-ready");
resize();
Promise.all([document.fonts.load('800 100px Poppins'),document.fonts.load('12px "Space Mono"')]).then(resize).catch(() => {dirty = true; start();});

// Preserve the original seven-strip word entrance.
if (!motion.matches) {
    document.querySelectorAll<HTMLElement>(".hero-word").forEach((word) => {
      const text = word.textContent ?? "";
      if (!text.trim()) return;
      word.textContent = "";
      const sizer = document.createElement("span");
      sizer.className = "sizer";
      sizer.textContent = text;
      word.appendChild(sizer);
      const STRIPS = 7;
      for (let index = 0; index < STRIPS; index += 1) {
        const strip = document.createElement("span");
        strip.className = "strip";
        strip.textContent = text;
        // 裁剪范围上下各留 40% 出血（g/y 等下伸部超出词框较多），条带间重叠 .4% 消除接缝
        const BLEED = 40;
        const span = 100 + BLEED * 2;
        strip.style.setProperty("--st", `${-BLEED + (index * span) / STRIPS - .4}%`);
        strip.style.setProperty("--sb", `${100 + BLEED - ((index + 1) * span) / STRIPS - .4}%`);
        strip.style.setProperty("--sd", `${index * 65}ms`);
        word.appendChild(strip);
      }
    });
  }

document.documentElement.classList.add("js");
