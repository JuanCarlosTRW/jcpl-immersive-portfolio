import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DirectionalLight, MathUtils, PointLight } from "three";
import { runtime } from "../../experience/runtime";

export function Lighting() {
  const worldLight = useRef<DirectionalLight>(null);
  const systemLight = useRef<PointLight>(null);
  const dreamLight = useRef<PointLight>(null);
  useFrame(() => {
    if (worldLight.current) {
      worldLight.current.intensity =
        0.4 + runtime.entry * 0.78 + runtime.camera * 0.68;
      worldLight.current.position.z = -42 - runtime.camera * 106;
      worldLight.current.position.y = 10 + runtime.camera * 17;
    }
    if (systemLight.current)
      systemLight.current.intensity =
        8 + MathUtils.smoothstep(runtime.camera, 0.48, 0.72) * 42;
    if (dreamLight.current)
      dreamLight.current.intensity =
        5 + MathUtils.smoothstep(runtime.camera, 0.72, 0.96) * 72;
  });
  return (
    <>
      <ambientLight intensity={0.18} color="#9ba7b2" />
      <hemisphereLight args={["#c9d1d6", "#171b20", 0.48]} />
      <directionalLight
        position={[-10, 16, 8]}
        intensity={1.8}
        color="#e6e2d9"
      />
      <directionalLight
        position={[8, 11, -8]}
        intensity={1.55}
        color="#b8c9d7"
      />
      <directionalLight
        ref={worldLight}
        position={[6, 18, -65]}
        color="#c8d8df"
      />
      <pointLight
        position={[-3.8, 0.7, 3]}
        intensity={16}
        distance={13}
        color="#fff0da"
      />
      <pointLight
        position={[4.1, 0.8, 2.6]}
        intensity={20}
        distance={15}
        color="#e9e9e2"
      />
      <pointLight
        position={[7, 8, -62]}
        intensity={36}
        distance={25}
        color="#b5cbd7"
      />
      <pointLight
        ref={systemLight}
        position={[-1, 14, -114]}
        intensity={8}
        distance={38}
        color="#d6c39d"
      />
      <pointLight
        ref={dreamLight}
        position={[0, 25, -160]}
        intensity={5}
        distance={55}
        color="#f1d6a0"
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-10, 12, 4]}
          scale={[6, 18, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.75}
          position={[9, 9, 0]}
          scale={[2, 20, 1]}
          rotation={[0, -Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.35}
          position={[0, 20, -20]}
          scale={[35, 20, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}
