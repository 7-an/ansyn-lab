import { geoProjection, geoArea } from "d3-geo";
import type { Polygon, MultiPolygon } from "geojson";

// Match the reference's camera distance / sphere radius and initial X rotation.
// Geometry is implemented locally; no reference rendering code or assets are copied.
const CAMERA_DISTANCE = 5.2 / 1.8;
const IMAGE_SCALE = Math.sqrt(CAMERA_DISTANCE ** 2 - 1);
export const INITIAL_TILT = .25;
const RAD = Math.PI / 180;

export function projectGlobe(lat: number, lon: number, rotation: number, tilt = INITIAL_TILT) {
  const p = lat * RAD, l = (lon + rotation) * RAD;
  const x = Math.cos(p) * Math.sin(l), y = Math.sin(p), z = Math.cos(p) * Math.cos(l);
  const viewY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const viewZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  const scale = IMAGE_SCALE / (CAMERA_DISTANCE - viewZ);
  return {x: x * scale, y: viewY * scale, z: viewZ - 1 / CAMERA_DISTANCE};
}

// Intersect a camera ray with the unit sphere, then undo its X/Y rotation.
export function unprojectGlobe(x: number, y: number, rotation: number, tilt = INITIAL_TILT) {
  if (x * x + y * y > 1) return null;
  const rayX = x / IMAGE_SCALE, rayY = y / IMAGE_SCALE;
  const a = 1 + rayX * rayX + rayY * rayY;
  const discriminant = CAMERA_DISTANCE ** 2 - a * (CAMERA_DISTANCE ** 2 - 1);
  const t = (CAMERA_DISTANCE - Math.sqrt(Math.max(0, discriminant))) / a;
  const viewY = t * rayY, viewZ = CAMERA_DISTANCE - t;
  const localY = viewY * Math.cos(tilt) + viewZ * Math.sin(tilt);
  const localZ = -viewY * Math.sin(tilt) + viewZ * Math.cos(tilt);
  return {
    lat: Math.asin(Math.max(-1, Math.min(1, localY))) / RAD,
    lon: ((Math.atan2(t * rayX, localZ) / RAD - rotation + 180) % 360 + 360) % 360 - 180
  };
}

// Use spherical clipping before projection: horizon crossings must be joined on
// the limb, never by a straight screen-space chord through the visible globe.
export function createGlobeProjection() {
  return geoProjection((lambda: number, phi: number): [number, number] => {
    const scale = IMAGE_SCALE / (CAMERA_DISTANCE - Math.cos(phi) * Math.cos(lambda));
    return [Math.cos(phi) * Math.sin(lambda) * scale, Math.sin(phi) * scale];
  }).clipAngle(Math.acos(1 / CAMERA_DISTANCE) / RAD).precision(.2);
}

export function prepareGlobePolygons(geometry: Polygon | MultiPolygon): Polygon[] {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(rings => ({
    type: "Polygon",
    coordinates: rings.map((ring, index) => {
      const smallSide = geoArea({type:"Polygon", coordinates:[ring]}) <= Math.PI * 2;
      // Exterior clockwise, holes counterclockwise; preserve islands and lakes.
      return smallSide === (index === 0) ? ring : [...ring].reverse();
    })
  }));
}

// Integrate exponential damping exactly, independent of display refresh rate.
export function coastStep(velocity: number, elapsed: number) {
  const decay = Math.exp(-elapsed / 440);
  return {distance: velocity * 440 * (1 - decay), velocity: velocity * decay};
}
