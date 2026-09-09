import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { EXPERIENCE } from "../experience/config";
import { runtime } from "../experience/runtime";
import { useExperience } from "../stores/experience";
import { createCameraPaths } from "../experience/cameraPaths";

const { camera: config } = EXPERIENCE;

export function CameraRig() {
  const { camera, size, invalidate } = useThree();
  const mobile = size.width < 760;
  const vectors = useMemo(
    () => ({
      point: new Vector3(),
      aim: new Vector3(),
      pointer: new Vector3(),
    }),
    [],
  );
  const paths = useMemo(() => createCameraPaths(mobile), [mobile]);
  useFrame((_, delta) => {
    const { phase, reducedMotion } = useExperience.getState();
    if (phase === "world") {
      const progress = reducedMotion ? 0 : runtime.scroll;
      paths.world.getPoint(progress, vectors.point);
      paths.worldAim.getPoint(progress, vectors.aim);
      // A portrait camera gives the destination breathing room.
      if (mobile && !reducedMotion) {
        vectors.point.z += runtime.scroll * config.mobileProjectPullback;
        vectors.point.x += runtime.scroll * config.mobileProjectOffset;
        vectors.aim.x += runtime.scroll * config.mobileProjectAimOffset;
      }
    } else {
      paths.entry.getPoint(runtime.entry, vectors.point);
      paths.entryAim.getPoint(runtime.entry, vectors.aim);
    }
    const pointerAmount =
      !reducedMotion && !mobile && phase === "portal"
        ? config.pointerTravel
        : 0;
    vectors.pointer.x = MathUtils.damp(
      vectors.pointer.x,
      runtime.pointerX * pointerAmount,
      2.5,
      delta,
    );
    vectors.pointer.y = MathUtils.damp(
      vectors.pointer.y,
      -runtime.pointerY * pointerAmount * 0.45,
      2.5,
      delta,
    );
    camera.position.copy(vectors.point).add(vectors.pointer);
    camera.lookAt(vectors.aim);
    const lens = camera as PerspectiveCamera;
    const fov =
      config.fov +
      Math.sin(runtime.entry * Math.PI) *
        (reducedMotion ? 0 : config.entryFovExpansion);
    if (Math.abs(lens.fov - fov) > 0.01) {
      lens.fov = fov;
      lens.updateProjectionMatrix();
    }
    if (phase === "entering") invalidate();
  });
  return null;
}
