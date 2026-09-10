import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  ACESFilmicToneMapping,
  FogExp2,
  MathUtils,
} from "three";
import { EXPERIENCE } from "../experience/config";
import { runtime } from "../experience/runtime";
import { useExperience } from "../stores/experience";
import { CameraRig } from "./CameraRig";
import { Portal } from "./Portal/Portal";
import { Dust } from "./particles/Dust";
import { Ground } from "./environment/Ground";
import { Architecture } from "./environment/Architecture";
import { Lighting } from "./environment/Lighting";
import { PerformanceGuard } from "./PerformanceGuard";
import { getReviewSettings } from "../experience/review";

function Ready({ onReady }: { onReady: () => void }) {
  const review = getReviewSettings();
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) {
      onReady();
    }
    if (frames.current >= 3 && review.enabled)
      document.documentElement.dataset.reviewReady = "true";
    if (frames.current < 4) invalidate();
  });
  return null;
}

function ReviewDiagnostics() {
  const review = getReviewSettings();
  const { gl, scene } = useThree();
  const frames = useRef(0);

  useFrame(() => {
    if (!review.enabled || frames.current++ < 5) return;
    const key = scene.getObjectByName("firstFlightKey") as
      | import("three").DirectionalLight
      | undefined;
    const traveler = scene.getObjectByName("traveler") as
      | import("three").PointLight
      | undefined;
    let wetStone: import("three").MeshPhysicalMaterial | undefined;
    scene.traverse((object) => {
      if (wetStone || !("material" in object)) return;
      const material = (object as import("three").Mesh).material;
      const candidates = Array.isArray(material) ? material : [material];
      wetStone = candidates.find(
        (candidate) => candidate.name === "firstFlightWetStone",
      ) as import("three").MeshPhysicalMaterial | undefined;
    });
    document.documentElement.dataset.reviewDiagnostics = JSON.stringify({
      rendererShadows: gl.shadowMap.enabled,
      shadowType: gl.shadowMap.type,
      keyCastShadow: key?.castShadow ?? false,
      keyShadowReady: Boolean(key?.shadow.map),
      travelerIntensity: Number((traveler?.intensity ?? 0).toFixed(3)),
      travelerCastShadow: traveler?.castShadow ?? false,
      wetStone: wetStone
        ? {
            metalness: wetStone.metalness,
            roughness: wetStone.roughness,
            clearcoat: wetStone.clearcoat,
            map: Boolean(wetStone.map),
            normalMap: Boolean(wetStone.normalMap),
            roughnessMap: Boolean(wetStone.roughnessMap),
            mapColorSpace: wetStone.map?.colorSpace,
            normalColorSpace: wetStone.normalMap?.colorSpace,
            roughnessColorSpace: wetStone.roughnessMap?.colorSpace,
          }
        : null,
    });
  });
  return null;
}

function ReviewRecorder() {
  const review = getReviewSettings();
  const { gl } = useThree();

  useEffect(() => {
    if (!review.enabled || review.shot !== "motion" || !review.record) return;
    const canvas = gl.domElement;
    const mimeType = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType || typeof canvas.captureStream !== "function") {
      document.documentElement.dataset.reviewRecording = "unsupported";
      return;
    }

    let animation = 0;
    let cancelled = false;
    const timers: number[] = [];
    const chunks: Blob[] = [];
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6_000_000,
    });

    document.documentElement.dataset.reviewRecording = "arming";
    runtime.scroll = 0.18;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      if (cancelled) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        document.documentElement.dataset.reviewVideo = String(reader.result);
        document.documentElement.dataset.reviewRecording = "complete";
      };
      reader.readAsDataURL(new Blob(chunks, { type: mimeType }));
    };

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        recorder.start(500);
        document.documentElement.dataset.reviewRecording = "recording";
        const started = performance.now();
        const duration = 6_000;
        const drive = (now: number) => {
          const linear = Math.min(1, (now - started) / duration);
          const eased = linear * linear * (3 - 2 * linear);
          runtime.scroll = MathUtils.lerp(0.18, 0.55, eased);
          if (linear < 1 && !cancelled) {
            animation = requestAnimationFrame(drive);
          } else if (recorder.state === "recording") {
            timers.push(window.setTimeout(() => recorder.stop(), 450));
          }
        };
        animation = requestAnimationFrame(drive);
      }, 900),
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(animation);
      timers.forEach((timer) => clearTimeout(timer));
      if (recorder.state === "recording") recorder.stop();
      else stream.getTracks().forEach((track) => track.stop());
      delete document.documentElement.dataset.reviewVideo;
      delete document.documentElement.dataset.reviewRecording;
    };
  }, [gl, review.enabled, review.record, review.shot]);

  return null;
}

function CinematicFog() {
  const fog = useRef<FogExp2>(null);
  useFrame(() => {
    if (!fog.current) return;
    fog.current.density = MathUtils.lerp(0.0135, 0.0065, runtime.camera);
  });
  return (
    <fogExp2
      ref={fog}
      attach="fog"
      args={[EXPERIENCE.colors.fog, 0.0135]}
    />
  );
}

export default function World({ onReady }: { onReady: () => void }) {
  const review = getReviewSettings();
  const quality = useExperience((s) => s.quality);
  const modalOpen = useExperience((s) => s.indexOpen || s.projectOpen);
  const shadows = review.enabled ? review.shadows === "on" : true;
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  return (
    <Canvas
      shadows={shadows ? "percentage" : false}
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
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      fallback={null}
      onCreated={({ gl }) => {
        gl.info.autoReset = false;
        gl.setClearAlpha(0);
      }}
      aria-label="A monumental obsidian route climbing through stairs, bridges and architectural stations"
    >
      <CinematicFog />
      <Lighting />
      <Portal />
      <Architecture />
      <Ground />
      <Dust />
      <CameraRig />
      {!review.enabled && <PerformanceGuard />}
      {(review.enabled ? review.bloom : EXPERIENCE.quality[quality].bloom) && (
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
      <ReviewDiagnostics />
      <ReviewRecorder />
    </Canvas>
  );
}
