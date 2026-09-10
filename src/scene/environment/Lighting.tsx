import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DirectionalLight, MathUtils, PointLight } from "three";
import { runtime } from "../../experience/runtime";
import { getReviewSettings } from "../../experience/review";

export function Lighting() {
  const review = getReviewSettings();
  const key = useRef<DirectionalLight>(null);
  const traveler = useRef<PointLight>(null);
  const arrival = useRef<PointLight>(null);

  useFrame(({ camera }) => {
    if (key.current) {
      key.current.intensity = 2 + runtime.camera * 1.2;
      key.current.position.set(
        -11 + runtime.camera * 8,
        22 + runtime.camera * 15,
        -34 - runtime.camera * 118,
      );
    }
    if (arrival.current) {
      arrival.current.intensity =
        MathUtils.smoothstep(runtime.camera, 0.82, 1) * 54;
    }
    if (traveler.current) {
      traveler.current.intensity =
        review.enabled && review.traveler === "off" ? 0 : 65;
      traveler.current.position.set(
        camera.position.x - 3.8,
        camera.position.y + 4.5,
        camera.position.z + 3,
      );
    }
  });

  return (
    <>
      <hemisphereLight args={["#b8c0c5", "#090b0d", 0.28]} />
      <directionalLight
        ref={key}
        position={[-11, 22, -34]}
        intensity={2}
        color="#e8eae8"
      />
      <directionalLight
        position={[13, 9, 10]}
        intensity={0.3}
        color="#9ca9b1"
      />
      <pointLight
        ref={traveler}
        intensity={65}
        distance={34}
        decay={2}
        color="#d7c1a2"
      />
      <pointLight
        ref={arrival}
        position={[0, 28, -174]}
        intensity={0}
        distance={62}
        color="#f3e5d0"
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={0.62}
          position={[-12, 18, -16]}
          scale={[5, 24, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.36}
          position={[11, 18, -82]}
          scale={[3, 28, 1]}
          rotation={[0, -Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.24}
          position={[0, 30, -165]}
          scale={[20, 34, 1]}
          rotation={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}
