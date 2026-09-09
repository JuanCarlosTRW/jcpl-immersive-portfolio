import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, Object3D } from "three";
import { seededRandom } from "../../utils/random";
import { useStoneMaterial } from "./StoneMaterial";

export function Architecture() {
  const mesh = useRef<InstancedMesh>(null);
  const stone = useStoneMaterial("#202428", 0.52);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  useEffect(
    () => () => {
      geometry.dispose();
      stone.dispose();
    },
    [geometry, stone],
  );
  useLayoutEffect(() => {
    const random = seededRandom(816);
    const dummy = new Object3D();
    for (let i = 0; i < 74; i++) {
      const side = i % 2 ? 1 : -1;
      const distant = i > 24;
      const h = distant ? 8 + random() * 23 : 0.5 + random() * 3;
      dummy.position.set(
        side * (distant ? 18 + random() * 42 : 8 + random() * 18),
        h / 2 - 0.1,
        distant ? -35 - random() * 105 : 6 - random() * 26,
      );
      dummy.scale.set(
        distant ? 1 + random() * 3 : 1.2 + random() * 3,
        h,
        1.2 + random() * 4,
      );
      dummy.rotation.set(
        distant ? 0 : random() * 0.3,
        random() * 0.8,
        distant ? (random() - 0.5) * 0.06 : (random() - 0.5) * 0.8,
      );
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    }
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh
        ref={mesh}
        args={[geometry, stone, 74]}
        frustumCulled={false}
      />
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} material={stone} position={[0, i * 0.15, -42 - i * 2.7]}>
          <boxGeometry args={[7.4, 0.18, 2.5]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * 3.77, 0.02, -27]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.022, 78]} />
            <meshBasicMaterial color="#79878a" />
          </mesh>
          <mesh position={[side * 5, 9.1, -94]} material={stone}>
            <boxGeometry args={[0.6, 18.2, 1.2]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 18.2, -94]} material={stone}>
        <boxGeometry args={[10.6, 0.65, 1.2]} />
      </mesh>
      <mesh position={[0, 9, -95]}>
        <planeGeometry args={[9.5, 18]} />
        <meshBasicMaterial color="#9ba8ac" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}
