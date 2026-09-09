import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group } from "three";
import { useRef } from "react";
import { runtime } from "../../experience/runtime";
import { useStoneMaterial } from "./StoneMaterial";

export default function ProjectDestination() {
  const stone = useStoneMaterial("#353a40", 0.65);
  const group = useRef<Group>(null);
  useEffect(() => () => stone.dispose(), [stone]);
  const strata = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: (i - 12.5) * 0.245,
        height:
          0.5 + Math.pow((i + 1) / 26, 1.6) * 3.8 + Math.sin(i * 0.27) * 0.6,
      })),
    [],
  );
  useFrame(() => {
    if (group.current) group.current.visible = runtime.entry > 0.42;
  });
  return (
    <group ref={group} position={[8.2, 0.15, -65]} rotation={[0, -0.16, 0]}>
      <mesh position={[0, 0.1, 0]} material={stone}>
        <boxGeometry args={[12.8, 0.2, 6.2]} />
      </mesh>
      <mesh position={[0, 5.2, -0.55]} material={stone}>
        <boxGeometry args={[10.4, 10.4, 1]} />
      </mesh>
      <mesh position={[0, 5.7, -0.025]}>
        <planeGeometry args={[8.9, 7.9]} />
        <meshBasicMaterial color="#090e12" />
      </mesh>
      {strata.map(({ x, height }, i) => (
        <mesh
          key={i}
          position={[x, 2.3 + height / 2, 0.38]}
          rotation={[0, -0.13, 0]}
        >
          <boxGeometry args={[0.1, height, 0.65]} />
          <meshStandardMaterial
            color="#a1aeb9"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.65, 0.06]}>
        <boxGeometry args={[8.9, 0.025, 0.025]} />
        <meshBasicMaterial color="#bdc6c9" toneMapped={false} />
      </mesh>
      <Html
        transform
        position={[-3.45, 8.7, 0.08]}
        distanceFactor={8}
        zIndexRange={[3, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="architectural-label" aria-hidden="true">
          <span>01</span>
          <small>
            SELECTED
            <br />
            WORK
          </small>
        </div>
      </Html>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={stone}
          position={[side * 5.75, 5.9, -0.35]}
          rotation={[0, 0, side * 0.015]}
        >
          <boxGeometry args={[0.45, 11.8, 1.4]} />
        </mesh>
      ))}
    </group>
  );
}
