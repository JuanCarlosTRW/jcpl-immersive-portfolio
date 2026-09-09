import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DirectionalLight } from "three";
import { runtime } from "../../experience/runtime";

export function Lighting() {
  const worldLight = useRef<DirectionalLight>(null);
  useFrame(() => {
    if (worldLight.current)
      worldLight.current.intensity =
        0.6 + runtime.entry * 1.4 + runtime.scroll * 0.6;
  });
  return (
    <>
      <ambientLight intensity={0.24} color="#9ba7b2" />
      <hemisphereLight args={["#c9d1d6", "#171b20", 0.7]} />
      <directionalLight
        position={[-10, 16, 8]}
        intensity={3.8}
        color="#e6e2d9"
      />
      <directionalLight position={[8, 11, -8]} intensity={4} color="#b8c9d7" />
      <directionalLight
        ref={worldLight}
        position={[6, 18, -65]}
        color="#c8d8df"
      />
      <pointLight
        position={[-3.8, 0.7, 3]}
        intensity={44}
        distance={13}
        color="#fff0da"
      />
      <pointLight
        position={[4.1, 0.8, 2.6]}
        intensity={60}
        distance={15}
        color="#e9e9e2"
      />
      <pointLight
        position={[7, 8, -62]}
        intensity={95}
        distance={25}
        color="#b5cbd7"
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[-10, 12, 4]}
          scale={[6, 18, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[9, 9, 0]}
          scale={[2, 20, 1]}
          rotation={[0, -Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[0, 20, -20]}
          scale={[35, 20, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}
