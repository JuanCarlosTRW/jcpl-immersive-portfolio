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
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Material,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
} from "three";
import { runtime } from "../../experience/runtime";
import { useStoneMaterial } from "./StoneMaterial";
import {
  type FirstFlightMaterials,
  useFirstFlightMaterials,
} from "./FirstFlightMaterials";

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

function DetailedFirstFlight({
  position,
  materials,
}: {
  position: Vector3Tuple;
  materials: FirstFlightMaterials;
}) {
  const steps = 12;
  const width = 7.6;
  const depth = 1.75;
  const rise = 0.38;
  const treads = useMemo(() => Array.from({ length: steps }, (_, index) => index), []);

  return (
    <group position={position} rotation={[0, -0.012, 0]}>
      <StairFlight
        position={[0, 0, 0]}
        steps={steps}
        width={width - 0.24}
        depth={depth}
        rise={rise}
        material={materials.riser}
      />
      {treads.map((index) => (
        <BeveledMass
          key={index}
          position={[0, (index + 1) * rise + 0.045, -index * depth - depth / 2]}
          size={[width, 0.09, depth + 0.05]}
          material={materials.surface}
          radius={0.032}
        />
      ))}
      <StairFlight
        position={[-width / 2 + 0.045, 0.096, 0]}
        steps={steps}
        width={0.09}
        depth={depth}
        rise={rise}
        material={materials.insert}
      />
      <StairFlight
        position={[width / 2 - 0.045, 0.096, 0]}
        steps={steps}
        width={0.09}
        depth={depth}
        rise={rise}
        material={materials.insert}
      />
    </group>
  );
}

function LandingSurface({ material }: { material: Material }) {
  const slabs = [
    [-5.5, -71.95, 5.38, 5.82],
    [0, -71.95, 5.38, 5.82],
    [5.5, -71.95, 5.38, 5.82],
    [-5.5, -77.91, 5.38, 5.82],
    [0, -77.91, 5.38, 5.82],
    [5.5, -77.91, 5.38, 5.82],
    [-5.5, -83.87, 5.38, 5.82],
    [0, -83.87, 5.38, 5.82],
    [5.5, -83.87, 5.38, 5.82],
  ] as const;

  return (
    <group>
      {slabs.map(([x, z, width, depth]) => (
        <BeveledMass
          key={`${x}-${z}`}
          position={[x, 4.605, z]}
          size={[width, 0.09, depth]}
          material={material}
          radius={0.028}
        />
      ))}
    </group>
  );
}

function AngularRock({
  position,
  scale,
  rotation,
  material,
}: {
  position: Vector3Tuple;
  scale: Vector3Tuple;
  rotation: Vector3Tuple;
  material: Material;
}) {
  const geometry = useMemo(() => {
    const indexed = new BufferGeometry();
    indexed.setAttribute(
      "position",
      new Float32BufferAttribute(
        [
          -0.82, -0.7, -0.62,
          0.72, -0.7, -0.68,
          0.94, -0.7, 0.38,
          -0.58, -0.7, 0.78,
          -0.52, 0.18, -0.42,
          0.46, 0.42, -0.5,
          0.58, 0.08, 0.32,
          -0.42, 0.34, 0.5,
          -0.18, 0.92, -0.08,
        ],
        3,
      ),
    );
    indexed.setIndex([
      0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5, 2, 3, 6, 3, 7, 6,
      3, 0, 7, 0, 4, 7, 4, 5, 8, 5, 6, 8, 6, 7, 8, 7, 4, 8,
      0, 3, 2, 0, 2, 1,
    ]);
    const faceted = indexed.toNonIndexed();
    indexed.dispose();
    faceted.computeVertexNormals();
    const positions = faceted.getAttribute("position");
    const uvs: number[] = [];
    for (let index = 0; index < positions.count; index += 1) {
      uvs.push(
        MathUtils.clamp((positions.getX(index) + 0.94) / 1.88, 0, 1),
        MathUtils.clamp((positions.getY(index) + 0.7) / 1.62, 0, 1),
      );
    }
    faceted.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    return faceted;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

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
  const firstFlight = useFirstFlightMaterials();
  const stone = useStoneMaterial("#292c2f", 0.32);
  const basalt = useStoneMaterial("#151719", 0.12);
  const wetStoneLegacy = useMemo(
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
      wetStoneLegacy.dispose();
      darkMetal.dispose();
      arrivalGlow.dispose();
      rockGeometry.dispose();
    }, [arrivalGlow, basalt, darkMetal, rockGeometry, stone, wetStoneLegacy],
  );

  return (
    <group>
      {/* MODULE 01 — THE THRESHOLD */}
      <RevealModule at={0}>
        <BeveledMass
          position={[0, 0.12, -32]}
          size={[9.6, 0.44, 30]}
          material={wetStoneLegacy}
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
        <BeveledMass
          position={[0, 0.315, -47.5]}
          size={[7.75, 0.09, 1]}
          material={firstFlight.surface}
          radius={0.026}
        />
        <DetailedFirstFlight position={[0, 0, -48]} materials={firstFlight} />
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
      <RevealModule at={0.12}>
        <BeveledMass
          position={[0, 4.28, -78]}
          size={[16.8, 0.58, 19]}
          material={firstFlight.riser}
          radius={0.08}
        />
        <LandingSurface material={firstFlight.surface} />
        <BeveledMass
          position={[-8.22, 4.62, -78.5]}
          size={[0.08, 0.11, 18.7]}
          material={firstFlight.insert}
          radius={0.018}
        />
        <BeveledMass
          position={[8.22, 4.62, -78.5]}
          size={[0.08, 0.11, 18.7]}
          material={firstFlight.insert}
          radius={0.018}
        />
        <BeveledMass
          position={[5.5, 5.05, -80]}
          size={[11, 1.45, 8.6]}
          rotation={[0, -0.025, 0]}
          material={firstFlight.riser}
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
        <AngularRock
          position={[5.2, 6.2, -73]}
          scale={[2.6, 4.6, 2.3]}
          rotation={[0.28, -0.5, 0.16]}
          material={firstFlight.rock}
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
          material={wetStoneLegacy}
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
          material={wetStoneLegacy}
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
          material={wetStoneLegacy}
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
          material={wetStoneLegacy}
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
