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
