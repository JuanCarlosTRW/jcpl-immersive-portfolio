import { ExtrudeGeometry, Shape, ShapeGeometry } from "three";
import { EXPERIENCE } from "../../experience/config.ts";

export function archShape(radius: number, spring: number, bottom: number) {
  const shape = new Shape();
  shape.moveTo(-radius, bottom);
  shape.lineTo(-radius, spring);
  shape.absarc(0, spring, radius, Math.PI, 0, true);
  shape.lineTo(radius, bottom);
  shape.closePath();
  return shape;
}

export function archFrame(radius: number, thickness: number, depth: number) {
  const { spring, bottom } = EXPERIENCE.portal;
  // One open arch contour. A hole that extends below an outer polygon breaks triangulation.
  const shape = new Shape();
  shape.moveTo(-radius, bottom);
  shape.lineTo(-radius, spring);
  shape.absarc(0, spring, radius, Math.PI, 0, true);
  shape.lineTo(radius, bottom);
  shape.lineTo(radius + thickness, bottom);
  shape.lineTo(radius + thickness, spring);
  shape.absarc(0, spring, radius + thickness, 0, Math.PI, false);
  shape.lineTo(-radius - thickness, bottom);
  shape.closePath();
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 48,
  });
}

export function apertureGeometry() {
  return new ShapeGeometry(
    archShape(
      EXPERIENCE.portal.radius,
      EXPERIENCE.portal.spring,
      EXPERIENCE.portal.bottom,
    ),
    64,
  );
}
