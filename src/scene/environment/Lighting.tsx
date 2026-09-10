import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DirectionalLight, MathUtils, PointLight, Vector3 } from "three";
import { runtime } from "../../experience/runtime";
import { getReviewSettings } from "../../experience/review";

export function Lighting() {
  const review = getReviewSettings();
  const key = useRef<DirectionalLight>(null);
  const traveler = useRef<PointLight>(null);
  const arrival = useRef<PointLight>(null);
  const movingKey = useRef(new Vector3());
  const stableKey = useRef(new Vector3(-7, 20, -40));
  const stableTarget = useRef(new Vector3(0, 7, -68));
  const worldOrigin = useRef(new Vector3(0, 0, 0));

  useFrame(({ camera }) => {
    if (key.current) {
      const enteringFirstFlight = MathUtils.smoothstep(
        runtime.camera,
        0.1,
        0.16,
      );
      const leavingFirstFlight = MathUtils.smoothstep(
        runtime.camera,
        0.39,
        0.48,
      );
      const firstFlightInfluence = enteringFirstFlight * (1 - leavingFirstFlight);
      movingKey.current.set(
        -11 + runtime.camera * 8,
        22 + runtime.camera * 15,
        -34 - runtime.camera * 118,
      );
      key.current.position.lerpVectors(
        movingKey.current,
        stableKey.current,
        firstFlightInfluence,
      );
      key.current.target.position.lerpVectors(
        worldOrigin.current,
        stableTarget.current,
        firstFlightInfluence,
      );
      key.current.target.updateMatrixWorld();
      key.current.intensity = MathUtils.lerp(
        2 + runtime.camera * 1.2,
        4.2,
        firstFlightInfluence,
      );
      key.current.castShadow = review.enabled
        ? review.shadows === "on"
        : firstFlightInfluence > 0.03;
    }
    if (arrival.current) {
      arrival.current.intensity =
        MathUtils.smoothstep(runtime.camera, 0.82, 1) * 54;
    }
    if (traveler.current) {
      const enteringFirstFlight = MathUtils.smoothstep(
        runtime.camera,
        0.1,
        0.16,
      );
      const leavingFirstFlight = MathUtils.smoothstep(
        runtime.camera,
        0.39,
        0.48,
      );
      const firstFlightInfluence = enteringFirstFlight * (1 - leavingFirstFlight);
      traveler.current.intensity = review.enabled
        ? review.traveler === "off"
          ? 0
          : review.traveler === "on"
            ? 18
            : 65
        : MathUtils.lerp(65, 18, firstFlightInfluence);
      traveler.current.distance = review.enabled
        ? review.traveler === "legacy"
          ? 34
          : 22
        : MathUtils.lerp(34, 22, firstFlightInfluence);
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
        name="firstFlightKey"
        position={[-11, 22, -34]}
        intensity={2}
        color="#e8eae8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={3}
        shadow-camera-far={60}
        shadow-camera-left={-15.5}
        shadow-camera-right={15.5}
        shadow-camera-top={24.5}
        shadow-camera-bottom={-16.5}
        shadow-bias={-0.00018}
        shadow-normalBias={0.018}
        shadow-radius={1.5}
        shadow-intensity={0.72}
      />
      <directionalLight
        position={[13, 9, 10]}
        intensity={0.3}
        color="#9ca9b1"
      />
      <pointLight
        ref={traveler}
        name="traveler"
        intensity={65}
        distance={34}
        decay={2}
        color="#d7c1a2"
        castShadow={false}
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
