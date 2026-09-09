import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EXPERIENCE } from "../experience/config";
import { useExperience } from "../stores/experience";

export function PerformanceGuard() {
  const { gl, invalidate } = useThree();
  const sample = useRef({
    frames: 0,
    last: performance.now(),
    started: performance.now(),
    slow: 0,
  });
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      useExperience.getState().failRenderer();
    };
    const visible = () => {
      sample.current.last = performance.now();
      sample.current.frames = 0;
      invalidate();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visible);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [gl, invalidate]);
  useFrame(() => {
    const calls = gl.info.render.calls;
    const triangles = gl.info.render.triangles;
    gl.info.reset();
    const now = performance.now();
    const current = sample.current;
    current.frames++;
    if (now - current.last < EXPERIENCE.performance.sampleMs) return;
    const fps = Math.round((current.frames * 1000) / (now - current.last));
    const state = useExperience.getState();
    if (import.meta.env.DEV) {
      const output = document.getElementById("performance-readout");
      if (output)
        output.textContent = `${fps} FPS · ${calls} calls · ${Math.round(triangles / 1000)}k tris · ${state.quality}`;
    }
    if (
      !document.hidden &&
      !state.reducedMotion &&
      state.phase !== "entering" &&
      now - current.started > EXPERIENCE.performance.warmupMs
    ) {
      current.slow =
        fps < EXPERIENCE.performance.slowFps ? current.slow + 1 : 0;
      if (
        current.slow >= EXPERIENCE.performance.slowSamples &&
        state.quality === "high"
      )
        state.setQuality("low");
    }
    current.frames = 0;
    current.last = now;
  }, -100);
  return null;
}
