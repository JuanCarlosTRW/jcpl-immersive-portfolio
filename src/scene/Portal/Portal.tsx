import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, ShaderMaterial } from "three";
import { EXPERIENCE } from "../../experience/config";
import { runtime } from "../../experience/runtime";
import { useExperience } from "../../stores/experience";
import { useStoneMaterial } from "../environment/StoneMaterial";
import { apertureFragment, apertureVertex } from "../shaders/aperture";
import { apertureGeometry, archFrame } from "./geometry";

export function Portal() {
  const group = useRef<Group>(null);
  const surface = useRef<ShaderMaterial>(null);
  const stone = useStoneMaterial();
  const frames = useMemo(
    () =>
      Array.from({ length: EXPERIENCE.portal.layers }, (_, i) =>
        archFrame(
          EXPERIENCE.portal.radius + i * 0.24,
          i === 3 ? 0.52 : 0.115,
          EXPERIENCE.portal.depth,
        ),
      ),
    [],
  );
  const aperture = useMemo(apertureGeometry, []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uEntry: { value: 0 }, uHover: { value: 0 } }),
    [],
  );
  useEffect(
    () => () => {
      frames.forEach((g) => g.dispose());
      aperture.dispose();
      stone.dispose();
    },
    [frames, aperture, stone],
  );
  useFrame((_, delta) => {
    if (!group.current || !surface.current) return;
    group.current.visible = runtime.entry < 0.96;
    if (!useExperience.getState().reducedMotion)
      uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uEntry.value = runtime.entry;
    uniforms.uHover.value +=
      (runtime.hover - uniforms.uHover.value) * Math.min(delta * 3, 1);
  });
  return (
    <group ref={group}>
      {frames.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={stone}
          position={[0, 0, i * 0.55]}
        />
      ))}
      <mesh geometry={aperture} position={[0, 0, -0.2]}>
        <shaderMaterial
          ref={surface}
          uniforms={uniforms}
          vertexShader={apertureVertex}
          fragmentShader={apertureFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            material={stone}
            position={[side * 4.16, 6.3, 0.58]}
            rotation={[0, 0, side * -0.012]}
          >
            <boxGeometry args={[0.78, 12.6, 1.6]} />
          </mesh>
          <mesh
            material={stone}
            position={[side * 4.84, 4.15, -0.08]}
            rotation={[0.035, 0, side * -0.065]}
          >
            <boxGeometry args={[0.8, 8.3, 1.2]} />
          </mesh>
          <mesh
            material={stone}
            position={[side * 5.46, 2.45, 0.8]}
            rotation={[0, 0, side * -0.12]}
          >
            <boxGeometry args={[1.0, 4.9, 2.1]} />
          </mesh>
          <mesh position={[side * 3.28, 4.0, 1.13]}>
            <boxGeometry args={[0.026, 6.9, 0.028]} />
            <meshBasicMaterial color="#d9e0e2" toneMapped={false} />
          </mesh>
          <mesh
            position={[side * 4.04, 0.25, 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.08, 1.6]} />
            <meshBasicMaterial color={[2.2, 2.15, 2]} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          material={stone}
          position={[0, 0.055 + i * 0.08, 3.2 - i * 0.55]}
        >
          <boxGeometry args={[8.4 - i * 0.24, 0.11 + i * 0.16, 0.7]} />
        </mesh>
      ))}
    </group>
  );
}
