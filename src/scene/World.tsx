import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { ACESFilmicToneMapping } from "three";
import { EXPERIENCE } from "../experience/config";
import { useExperience } from "../stores/experience";
import { CameraRig } from "./CameraRig";
import { Portal } from "./Portal/Portal";
import { Dust } from "./particles/Dust";
import { Ground } from "./environment/Ground";
import { Architecture } from "./environment/Architecture";
import { Lighting } from "./environment/Lighting";
import { PerformanceGuard } from "./PerformanceGuard";
import { Atmosphere } from "./environment/Atmosphere";

function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) onReady();
    if (frames.current < 4) invalidate();
  });
  return null;
}

export default function World({ onReady }: { onReady: () => void }) {
  const quality = useExperience((s) => s.quality);
  const modalOpen = useExperience((s) => s.indexOpen || s.projectOpen);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  return (
    <Canvas
      dpr={[1, EXPERIENCE.quality[quality].dpr]}
      frameloop={!visible || modalOpen ? "demand" : "always"}
      camera={{
        position: EXPERIENCE.camera.start,
        fov: EXPERIENCE.camera.fov,
        near: EXPERIENCE.camera.near,
        far: EXPERIENCE.camera.far,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      fallback={null}
      onCreated={({ gl }) => {
        gl.info.autoReset = false;
      }}
      aria-label="A monumental obsidian route climbing through stairs, bridges and architectural stations"
    >
      <color attach="background" args={[EXPERIENCE.colors.void]} />
      <fogExp2 attach="fog" args={[EXPERIENCE.colors.fog, 0.0085]} />
      <Atmosphere />
      <Lighting />
      <Portal />
      <Architecture />
      <Ground />
      <Dust />
      <CameraRig />
      <PerformanceGuard />
      {EXPERIENCE.quality[quality].bloom && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={1.2}
            luminanceSmoothing={0.6}
            intensity={0.24}
            mipmapBlur
          />
        </EffectComposer>
      )}
      <Ready onReady={onReady} />
    </Canvas>
  );
}
