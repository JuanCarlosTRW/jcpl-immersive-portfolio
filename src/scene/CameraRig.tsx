import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { EXPERIENCE } from "../experience/config";
import { runtime } from "../experience/runtime";
import { useExperience } from "../stores/experience";
import {
  createCameraPaths,
  mapScrollToRailProgress,
} from "../experience/cameraPaths";
import { getReviewSettings } from "../experience/review";

const { camera: config } = EXPERIENCE;

export function CameraRig() {
  const review = getReviewSettings();
  const { camera, size, invalidate } = useThree();
  const mobile = size.width < 760;
  const vectors = useMemo(
    () => ({
      point: new Vector3(),
      aim: new Vector3(),
      pointer: new Vector3(),
      drift: new Vector3(),
      smoothAim: new Vector3(),
    }),
    [],
  );
  const paths = useMemo(() => createCameraPaths(mobile), [mobile]);
  const renderedProgress = useRef(review.rail ?? 0);
  const aimReady = useRef(false);
  useFrame((state, delta) => {
    const { phase, reducedMotion } = useExperience.getState();
    if (phase === "world") {
      const targetProgress = review.rail ?? mapScrollToRailProgress(runtime.scroll);
      renderedProgress.current =
        review.rail ??
        MathUtils.damp(
          renderedProgress.current,
          targetProgress,
          reducedMotion ? 12 : 5.8,
          delta,
        );
      runtime.camera = renderedProgress.current;
      paths.world.getPointAt(renderedProgress.current, vectors.point);
      paths.worldAim.getPointAt(renderedProgress.current, vectors.aim);
      if (mobile) {
        vectors.point.z += renderedProgress.current * config.mobileProjectPullback;
        vectors.point.x += renderedProgress.current * config.mobileProjectOffset;
        vectors.aim.x += renderedProgress.current * config.mobileProjectAimOffset;
      }
    } else {
      paths.entry.getPoint(runtime.entry, vectors.point);
      paths.entryAim.getPoint(runtime.entry, vectors.aim);
      renderedProgress.current = 0;
      runtime.camera = 0;
    }
    const pointerAmount =
      !review.enabled && !reducedMotion && !mobile
        ? phase === "portal"
          ? config.pointerTravel
          : phase === "world"
            ? 0.075
            : 0
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
    const worldMotion = phase === "world" && !reducedMotion && !review.enabled;
    const elapsed = state.clock.elapsedTime;
    vectors.drift.set(
      worldMotion ? Math.sin(elapsed * 0.33) * 0.018 : 0,
      worldMotion ? Math.sin(elapsed * 0.52) * 0.012 : 0,
      0,
    );
    camera.position
      .copy(vectors.point)
      .add(vectors.pointer)
      .add(vectors.drift);
    if (!aimReady.current) {
      vectors.smoothAim.copy(vectors.aim);
      aimReady.current = true;
    } else {
      vectors.smoothAim.lerp(
        vectors.aim,
        1 - Math.exp(-(reducedMotion ? 18 : 8.5) * delta),
      );
    }
    camera.lookAt(vectors.smoothAim);
    const lens = camera as PerspectiveCamera;
    const fov =
      config.fov +
      Math.sin(runtime.entry * Math.PI) *
        (reducedMotion ? 0 : config.entryFovExpansion);
    if (Math.abs(lens.fov - fov) > 0.01) {
      lens.fov = fov;
      lens.updateProjectionMatrix();
    }
    if (review.enabled) {
      document.documentElement.dataset.reviewCamera = JSON.stringify({
        rail: Number(runtime.camera.toFixed(6)),
        position: camera.position.toArray().map((value) => Number(value.toFixed(6))),
        aim: vectors.smoothAim.toArray().map((value) => Number(value.toFixed(6))),
        fov: Number(lens.fov.toFixed(6)),
      });
    }
    if (phase === "entering") invalidate();
  });
  return null;
}
