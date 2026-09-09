import test from "node:test";
import assert from "node:assert/strict";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { archFrame, apertureGeometry } from "../src/scene/Portal/geometry.ts";
import { createCameraPaths } from "../src/experience/cameraPaths.ts";
import { EXPERIENCE } from "../src/experience/config.ts";

test("the arch contains stone at its sides and crown, with an unobstructed opening", () => {
  const geometry = archFrame(3.05, 0.52, 0.48);
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  const hit = (x, y) =>
    new Raycaster(new Vector3(x, y, 4), new Vector3(0, 0, -1)).intersectObject(
      mesh,
    ).length > 0;
  assert.equal(hit(0, 5), false, "camera corridor stays open");
  assert.equal(hit(0, 0.5), false, "no accidental threshold wall");
  assert.equal(hit(3.25, 5), true, "right column exists");
  assert.equal(hit(-3.25, 5), true, "left column exists");
  assert.equal(hit(0, 11.4), true, "arched crown exists");
  geometry.dispose();
  material.dispose();
});

test("the aperture covers the opening and has finite geometry", () => {
  const geometry = apertureGeometry();
  for (const value of geometry.attributes.position.array)
    assert.ok(Number.isFinite(value));
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  assert.ok(
    new Raycaster(new Vector3(0, 5, 4), new Vector3(0, 0, -1)).intersectObject(
      mesh,
    ).length > 0,
  );
  geometry.dispose();
  material.dispose();
});

for (const mobile of [false, true]) {
  test(`${mobile ? "mobile" : "desktop"} camera crosses the aperture, stays above ground and joins the world without a jump`, () => {
    const paths = createCameraPaths(mobile);
    let previous = paths.entry.getPoint(0);
    let crossed = false;
    for (let i = 1; i <= 500; i++) {
      const point = paths.entry.getPoint(i / 500);
      assert.ok(point.y > 1.5, "camera above floor");
      assert.ok(point.distanceTo(previous) < 0.3, "continuous path");
      assert.ok(point.z < previous.z, "forward motion through entry");
      if (previous.z >= 0 && point.z < 0) {
        crossed = true;
        assert.ok(Math.abs(point.x) < EXPERIENCE.portal.radius - 0.5);
        assert.ok(point.y < EXPERIENCE.portal.spring);
      }
      previous = point;
    }
    assert.ok(crossed);
    assert.ok(
      paths.entry.getPoint(1).distanceTo(paths.world.getPoint(0)) < 1e-8,
    );
    assert.ok(
      paths.entryAim.getPoint(1).distanceTo(paths.worldAim.getPoint(0)) < 1e-8,
    );
  });
}
