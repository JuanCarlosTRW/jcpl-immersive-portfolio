import { CatmullRomCurve3, Vector3 } from "three";
import { EXPERIENCE } from "./config.ts";

export function createCameraPaths(mobile: boolean) {
  const config = EXPERIENCE.camera;
  const curve = (points: [number, number, number][]) =>
    new CatmullRomCurve3(
      points.map((point) => new Vector3(...point)),
      false,
      "centripetal",
    );
  return {
    entry: curve([
      mobile ? config.mobileStart : config.start,
      ...config.entryWaypoints,
      config.arrival,
    ]),
    entryAim: curve([
      mobile ? config.mobileAim : config.aim,
      ...config.entryAimWaypoints,
      config.arrivalAim,
    ]),
    world: curve([config.arrival, ...config.worldWaypoints, config.project]),
    worldAim: curve([
      config.arrivalAim,
      ...config.worldAimWaypoints,
      config.projectAim,
    ]),
  };
}

const railKeys = [
  [0, 0],
  [0.11, 0.055],
  [0.23, 0.17],
  [0.29, 0.235],
  [0.38, 0.25],
  [0.42, 0.335],
  [0.48, 0.425],
  [0.55, 0.44],
  [0.57, 0.525],
  [0.64, 0.62],
  [0.71, 0.64],
  [0.73, 0.715],
  [0.8, 0.825],
  [0.87, 0.845],
  [0.9, 0.91],
  [1, 1],
] as const;

const smoothstep = (value: number) => value * value * (3 - 2 * value);

export function mapScrollToRailProgress(scrollProgress: number) {
  const progress = Math.min(1, Math.max(0, scrollProgress));
  for (let i = 1; i < railKeys.length; i++) {
    const [endScroll, endRail] = railKeys[i];
    if (progress > endScroll) continue;
    const [startScroll, startRail] = railKeys[i - 1];
    const local = (progress - startScroll) / (endScroll - startScroll);
    return startRail + (endRail - startRail) * smoothstep(local);
  }
  return 1;
}
