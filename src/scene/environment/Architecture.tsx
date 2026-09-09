import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  DodecahedronGeometry,
  ExtrudeGeometry,
  Group,
  Material,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
} from "three";
import { runtime } from "../../experience/runtime";
import { useStoneMaterial } from "./StoneMaterial";

type Vector3Tuple = [number, number, number];

function BeveledMass({
  position,
  size,
  rotation = [0, 0, 0],
  material,
  radius,
}: {
  position: Vector3Tuple;
  size: Vector3Tuple;
  rotation?: Vector3Tuple;
  material: Material;
  radius?: number;
}) {
  const safeRadius =
    radius ?? Math.min(0.11, Math.min(size[0], size[1], size[2]) * 0.18);

  return (
    <RoundedBox
      args={size}
      position={position}
      rotation={rotation}
      radius={safeRadius}
      smoothness={2}
      castShadow
      receiveShadow
    >
      <primitive object={material} attach="material" />
    </RoundedBox>
  );
}

function StairFlight({
  position,
  steps,
  width,
  depth,
  rise,
  yaw = 0,
  material,
}: {
  position: Vector3Tuple;
  steps: number;
  width: number;
  depth: number;
  rise: number;
  yaw?: number;
  material: Material;
}) {
  const geometry = useMemo(() => {
    const length = steps * depth;
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(length, 0);
    shape.lineTo(length, steps * rise);

    for (let index = steps - 1; index >= 0; index -= 1) {
      shape.lineTo(index * depth, (index + 1) * rise);
      shape.lineTo(index * depth, index * rise);
    }
    shape.closePath();

    const staircase = new ExtrudeGeometry(shape, {
      depth: width,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.055,
      bevelThickness: 0.055,
      curveSegments: 1,
    });
    staircase.translate(0, 0, -width / 2);
    staircase.rotateY(Math.PI / 2);
    staircase.computeVertexNormals();
    return staircase;
  }, [depth, rise, steps, width]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={[0, yaw, 0]}
      castShadow
      receiveShadow
    />
  );
}

function RevealModule({
  children,
  at,
}: {
  children: ReactNode;
  at: number;
}) {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const reveal = MathUtils.smoothstep(runtime.camera, at - 0.12, at + 0.04);
    group.current.position.y = -0.16 * (1 - reveal);
  });

  return <group ref={group}>{children}</group>;
}

function Rock({
  position,
  scale,
  rotation,
  geometry,
  material,
}: {
  position: Vector3Tuple;
  scale: Vector3Tuple;
  rotation: Vector3Tuple;
  geometry: DodecahedronGeometry;
  material: Material;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}

export function Architecture() {
  const stone = useStoneMaterial("#292c2f", 0.32);
  const basalt = useStoneMaterial("#151719", 0.12);
  const wetStone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#1a1d20",
        roughness: 0.36,
        metalness: 0.4,
      }),
    [],
  );
  const darkMetal = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#292725",
        roughness: 0.34,
        metalness: 0.72,
      }),
    [],
  );
  const arrivalGlow = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#f2eadf",
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    [],
  );
  const rockGeometry = useMemo(() => new DodecahedronGeometry(1, 1), []);

  useEffect(
    () => () => {
      stone.dispose();
      basalt.dispose();
      wetStone.dispose();
      darkMetal.dispose();
      arrivalGlow.dispose();
      rockGeometry.dispose();
    }, [arrivalGlow, basalt, darkMetal, rockGeometry, stone, wetStone],
  );

  return (
    <group>
      {/* MODULE 01 — THE THRESHOLD */}
      <RevealModule at={0}>
        <BeveledMass
          position={[0, 0.12, -32]}
          size={[9.6, 0.44, 30]}
          material={wetStone}
          radius={0.07}
        />
        <BeveledMass
          position={[-5.4, 1.35, -34]}
          size={[1.7, 2.7, 20]}
          rotation={[0, 0.035, 0]}
          material={basalt}
        />
        <BeveledMass
          position={[5.25, 0.9, -37]}
          size={[1.45, 1.8, 14]}
          rotation={[0, -0.028, 0]}
          material={stone}
        />
        <BeveledMass
          position={[-7.4, 5.2, -45.5]}
          size={[2.2, 10.4, 3.6]}
          material={basalt}
        />
        <BeveledMass
          position={[7.6, 4.4, -45.5]}
          size={[2.45, 8.8, 3.8]}
          material={stone}
        />
        <Rock
          position={[-6.8, 1.6, -20.5]}
          scale={[3.2, 4.1, 2.5]}
          rotation={[0.08, 0.42, -0.18]}
          geometry={rockGeometry}
          material={basalt}
        />
        <Rock
          position={[7.2, 1.15, -24]}
          scale={[2.7, 3.4, 2.9]}
          rotation={[0.22, -0.38, 0.09]}
          geometry={rockGeometry}
          material={basalt}
        />
      </RevealModule>

      {/* MODULE 02 — FIRST ASCENT */}
      <RevealModule at={0.12}>
        <StairFlight
          position={[0, 0, -48]}
          steps={12}
          width={7.6}
          depth={1.67}
          rise={0.35}
          yaw={-0.012}
          material={wetStone}
        />
        <BeveledMass
          position={[-6.7, 2.6, -56]}
          size={[2.05, 5.2, 8.4]}
          rotation={[0, 0.05, 0]}
          material={basalt}
        />
        <BeveledMass
          position={[6.9, 3.8, -61]}
          size={[2.25, 7.6, 7.1]}
          rotation={[0, -0.045, 0]}
          material={stone}
        />
        <BeveledMass
          position={[-7.7, 7.8, -62]}
          size={[3.4, 15.6, 4.5]}
          material={basalt}
        />
        <BeveledMass
          position={[8.4, 9.8, -67]}
          size={[3.2, 19.6, 4.3]}
          material={basalt}
        />
        <Rock
          position={[-4.5, 4.3, -67]}
          scale={[2.2, 3.5, 2.1]}
          rotation={[0.4, 0.28, -0.12]}
          geometry={rockGeometry}
          material={basalt}
        />
      </RevealModule>
      {/* MODULE 03 — THE MONUMENTAL PLATFORM */}
      <RevealModule at={0.4}>
        <BeveledMass
          position={[0.4, 4.28, -78.5]}
          size={[16.8, 0.58, 19]}
          material={wetStone}
          radius={0.08}
        />
        <BeveledMass
          position={[5.5, 5.05, -80]}
          size={[11, 1.45, 8.6]}
          rotation={[0, -0.025, 0]}
          material={stone}
        />
        <BeveledMass
          position={[-6.5, 13.1, -80]}
          size={[3.1, 17.2, 4.5]}
          rotation={[0, 0.035, 0]}
          material={basalt}
        />
        <BeveledMass
          position={[0.2, 16.1, -82]}
          size={[15.2, 1.25, 5.2]}
          rotation={[0, -0.02, 0.015]}
          material={darkMetal}
        />
        <BeveledMass
          position={[7.8, 11.3, -86]}
          size={[2.8, 13.5, 4.2]}
          material={basalt}
        />
        <Rock
          position={[5.2, 6.2, -73]}
          scale={[2.6, 4.6, 2.3]}
          rotation={[0.28, -0.5, 0.16]}
          geometry={rockGeometry}
          material={basalt}
        />
      </RevealModule>
      {/* MODULE 04 — UPPER ASCENT */}
      <RevealModule at={0.61}>
        <StairFlight
          position={[0.35, 4.2, -87]}
          steps={15}
          width={7.35}
          depth={1.46}
          rise={0.332}
          yaw={0.018}
          material={wetStone}
        />
        <BeveledMass
          position={[-4.85, 10.1, -98]}
          size={[2.4, 11.6, 9.4]}
          rotation={[0, 0.04, 0]}
          material={basalt}
        />
        <BeveledMass
          position={[5.25, 13.3, -104]}
          size={[2.55, 17.8, 8.2]}
          rotation={[0, -0.045, 0]}
          material={stone}
        />
        <BeveledMass
          position={[0, 8.94, -119.5]}
          size={[7.5, 0.5, 20]}
          material={wetStone}
          radius={0.07}
        />
        <BeveledMass
          position={[-6.3, 18.8, -120]}
          size={[3.2, 20.4, 5.3]}
          material={basalt}
        />
        <BeveledMass
          position={[7.15, 21.5, -125]}
          size={[3.5, 25.6, 5.4]}
          material={basalt}
        />
        <StairFlight
          position={[-0.15, 8.77, -130]}
          steps={14}
          width={6.8}
          depth={1.5}
          rise={0.422}
          yaw={-0.016}
          material={wetStone}
        />
        <Rock
          position={[-8.7, 12.3, -133]}
          scale={[2.8, 5, 2.5]}
          rotation={[0.38, 0.18, -0.14]}
          geometry={rockGeometry}
          material={basalt}
        />
        <Rock
          position={[10.2, 15.3, -146]}
          scale={[2, 3.6, 2.1]}
          rotation={[0.12, -0.35, 0.09]}
          geometry={rockGeometry}
          material={basalt}
        />
      </RevealModule>
      {/* MODULE 05 — ARRIVAL */}
      <RevealModule at={0.86}>
        <BeveledMass
          position={[0, 14.78, -160.5]}
          size={[19.5, 0.65, 22]}
          material={wetStone}
          radius={0.09}
        />
        <BeveledMass
          position={[-7.35, 26.7, -174]}
          size={[3.15, 23.8, 5.2]}
          material={basalt}
        />
        <BeveledMass
          position={[7.35, 26.7, -174]}
          size={[3.15, 23.8, 5.2]}
          material={basalt}
        />
        <BeveledMass
          position={[0, 38, -174]}
          size={[17.8, 1.5, 5.2]}
          material={darkMetal}
        />
        <BeveledMass
          position={[-3.8, 20.6, -171.5]}
          size={[1.55, 11.2, 2.6]}
          material={stone}
        />
        <BeveledMass
          position={[3.8, 20.6, -171.5]}
          size={[1.55, 11.2, 2.6]}
          material={stone}
        />
        <mesh position={[0, 25.5, -176.7]} material={arrivalGlow}>
          <planeGeometry args={[10.2, 24]} />
        </mesh>
      </RevealModule>
      {/* Authored distant silhouettes — secondary depth only. */}
      {[
        [-15, 16, -48, 4.2, 32, 5.5, 0.12],
        [16, 21, -59, 5.2, 42, 6, -0.1],
        [-20, 25, -86, 5.5, 50, 7, 0.08],
        [18, 28, -96, 4.7, 56, 6.5, -0.05],
        [-15, 33, -121, 5.8, 56, 7.2, 0.07],
        [17, 39, -136, 5.1, 62, 6.5, -0.08],
        [-22, 47, -162, 7.2, 72, 8.5, 0.04],
        [21, 50, -181, 6.5, 70, 7.8, -0.06],
      ].map(([x, y, z, width, height, depth, yaw], index) => (
        <BeveledMass
          key={`${x}-${z}`}
          position={[x, y, z]}
          size={[width, height, depth]}
          rotation={[0, yaw, index % 2 ? -0.012 : 0.012]}
          material={basalt}
          radius={0.08}
        />
      ))}
    </group>
  );
}
