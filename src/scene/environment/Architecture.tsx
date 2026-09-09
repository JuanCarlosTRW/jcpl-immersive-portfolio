import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  DodecahedronGeometry,
  InstancedMesh,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from "three";
import { seededRandom } from "../../utils/random";
import { useExperience } from "../../stores/experience";
import { routeHeightAt } from "../../experience/route";
import { useStoneMaterial } from "./StoneMaterial";

function Slab({
  position,
  size,
  material,
  glow,
  rails = false,
}: {
  position: [number, number, number];
  size: [number, number, number];
  material: Material;
  glow: Material;
  rails?: boolean;
}) {
  const surface = position[1] + size[1] / 2;
  return (
    <group>
      <mesh position={position} material={material} receiveShadow>
        <boxGeometry args={size} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[
              position[0] + side * (size[0] / 2 - 0.035),
              surface + 0.025,
              position[2],
            ]}
            material={glow}
          >
            <boxGeometry args={[0.035, 0.035, size[2] * 0.96]} />
          </mesh>
          {rails && (
            <mesh
              position={[
                position[0] + side * (size[0] / 2 + 0.16),
                surface + 0.55,
                position[2],
              ]}
              material={material}
            >
              <boxGeometry args={[0.34, 1.1, size[2]]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function StairFlight({
  startZ,
  baseY,
  steps,
  width,
  depth,
  rise,
  material,
  glow,
}: {
  startZ: number;
  baseY: number;
  steps: number;
  width: number;
  depth: number;
  rise: number;
  material: Material;
  glow: Material;
}) {
  return (
    <group>
      {Array.from({ length: steps }, (_, index) => {
        const height = 0.46 + (index + 1) * rise;
        const surface = baseY + (index + 1) * rise;
        const z = startZ - index * depth;
        return (
          <group key={index}>
            <mesh
              position={[0, surface - height / 2, z]}
              material={material}
              receiveShadow
            >
              <boxGeometry args={[width, height, depth + 0.06]} />
            </mesh>
            <mesh
              position={[0, surface + 0.022, z + depth / 2 - 0.045]}
              material={glow}
            >
              <boxGeometry args={[width - 0.55, 0.028, 0.035]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function StationPlinth({
  position,
  number,
  material,
  glow,
  beacon,
  glass,
}: {
  position: [number, number, number];
  number: number;
  material: Material;
  glow: Material;
  beacon: Material;
  glass: Material;
}) {
  return (
    <group position={position}>
      <mesh material={material} position={[0, 0.45, 0]}>
        <boxGeometry args={[1.15, 0.9, 1.15]} />
      </mesh>
      <mesh material={glow} position={[0, 1.62, 0]}>
        <boxGeometry args={[0.026, 2.25, 0.026]} />
      </mesh>
      <mesh material={beacon} position={[0, 3.06, 0]}>
        <torusGeometry args={[0.5 + number * 0.045, 0.026, 8, 42]} />
      </mesh>
      <mesh material={glass} position={[0, 3.06, 0]}>
        <sphereGeometry args={[0.34 + number * 0.022, 18, 12]} />
      </mesh>
      {Array.from({ length: number }, (_, index) => {
        const x = (index - (number - 1) / 2) * 0.22;
        return (
          <mesh key={index} material={beacon} position={[x, 3.06, 0.35]}>
            <sphereGeometry args={[0.035 + number * 0.004, 10, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Architecture() {
  const distant = useRef<InstancedMesh>(null);
  const rocks = useRef<InstancedMesh>(null);
  const quality = useExperience((state) => state.quality);
  const stone = useStoneMaterial("#202328", 0.38);
  const darkStone = useStoneMaterial("#15171a", 0.24);
  const boxGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const rockGeometry = useMemo(() => new DodecahedronGeometry(1, 0), []);
  const glow = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#b99560",
        toneMapped: false,
      }),
    [],
  );
  const beacon = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#8f724c",
        emissive: "#b18450",
        emissiveIntensity: 0.85,
        roughness: 0.34,
        metalness: 0.52,
      }),
    [],
  );
  const glass = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#9c8a6f",
        emissive: "#6f5837",
        emissiveIntensity: 0.24,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        roughness: 0.18,
        metalness: 0.16,
      }),
    [],
  );
  const matte = useTexture("/images/ascent-journey.webp");
  matte.colorSpace = SRGBColorSpace;
  matte.anisotropy = 4;
  matte.repeat.set(1, 0.58);
  matte.offset.set(0, 0.42);

  const distantCount = quality === "high" ? 58 : 34;
  const rockCount = quality === "high" ? 72 : 42;

  useEffect(
    () => () => {
      boxGeometry.dispose();
      rockGeometry.dispose();
      glow.dispose();
      beacon.dispose();
      glass.dispose();
      stone.dispose();
      darkStone.dispose();
    },
    [boxGeometry, rockGeometry, glow, beacon, glass, stone, darkStone],
  );

  useLayoutEffect(() => {
    const random = seededRandom(816);
    const dummy = new Object3D();
    for (let i = 0; i < distantCount; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -20 - random() * 164;
      const h = 9 + random() * 27;
      dummy.position.set(
        side * (13 + random() * 34),
        routeHeightAt(z) + h / 2 - 1.2,
        z,
      );
      dummy.scale.set(1.1 + random() * 3.4, h, 1.5 + random() * 5.2);
      dummy.rotation.set(
        (random() - 0.5) * 0.045,
        random() * 0.82,
        (random() - 0.5) * 0.055,
      );
      dummy.updateMatrix();
      distant.current?.setMatrixAt(i, dummy.matrix);
    }
    if (distant.current) distant.current.instanceMatrix.needsUpdate = true;

    const rockRandom = seededRandom(194);
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -22 - rockRandom() * 146;
      const scale = 1.1 + rockRandom() * 3.25;
      dummy.position.set(
        side * (8.4 + rockRandom() * 13.5),
        routeHeightAt(z) + scale * 0.2 - 0.9,
        z,
      );
      dummy.scale.set(
        scale * (0.8 + rockRandom()),
        scale * (0.65 + rockRandom() * 1.25),
        scale * (0.75 + rockRandom()),
      );
      dummy.rotation.set(
        rockRandom() * Math.PI,
        rockRandom() * Math.PI,
        rockRandom() * Math.PI,
      );
      dummy.updateMatrix();
      rocks.current?.setMatrixAt(i, dummy.matrix);
    }
    if (rocks.current) rocks.current.instanceMatrix.needsUpdate = true;
  }, [distantCount, rockCount]);

  return (
    <group>
      <mesh position={[0, 49, -218]} scale={[1.72, 1, 1]}>
        <planeGeometry args={[155, 70]} />
        <meshBasicMaterial
          map={matte}
          color="#657078"
          transparent
          opacity={0.13}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      <instancedMesh
        ref={distant}
        args={[boxGeometry, stone, distantCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={rocks}
        args={[rockGeometry, darkStone, rockCount]}
        frustumCulled={false}
      />

      <Slab
        position={[0, 0.15, -31]}
        size={[8.4, 0.38, 28]}
        material={stone}
        glow={glow}
        rails
      />
      <Slab
        position={[0, 0.15, -47]}
        size={[12.2, 0.6, 7.5]}
        material={stone}
        glow={glow}
      />
      <StairFlight
        startZ={-51}
        baseY={0.45}
        steps={13}
        width={8.2}
        depth={1.32}
        rise={0.315}
        material={stone}
        glow={glow}
      />
      <Slab
        position={[0.45, 4.32, -76]}
        size={[8.6, 0.44, 16]}
        material={stone}
        glow={glow}
        rails
      />
      <Slab
        position={[0.45, 4.35, -85]}
        size={[12.8, 0.52, 7]}
        material={stone}
        glow={glow}
      />
      <StairFlight
        startZ={-89}
        baseY={4.58}
        steps={15}
        width={8}
        depth={1.28}
        rise={0.305}
        material={stone}
        glow={glow}
      />
      <Slab
        position={[-0.3, 8.94, -111]}
        size={[13.8, 0.52, 10]}
        material={stone}
        glow={glow}
      />
      <Slab
        position={[0.3, 8.98, -123]}
        size={[7.8, 0.42, 18]}
        material={stone}
        glow={glow}
        rails
      />
      <StairFlight
        startZ={-133}
        baseY={9.22}
        steps={14}
        width={8.3}
        depth={1.3}
        rise={0.42}
        material={stone}
        glow={glow}
      />
      <Slab
        position={[0, 14.77, -158]}
        size={[19, 0.66, 19]}
        material={stone}
        glow={glow}
      />

      <StationPlinth
        position={[4.9, 2.88, -58]}
        number={1}
        material={stone}
        glow={glow}
        beacon={beacon}
        glass={glass}
      />
      <StationPlinth
        position={[-4.6, 4.64, -83]}
        number={2}
        material={stone}
        glow={glow}
        beacon={beacon}
        glass={glass}
      />
      <StationPlinth
        position={[5.35, 9.26, -111]}
        number={3}
        material={stone}
        glow={glow}
        beacon={beacon}
        glass={glass}
      />
      <StationPlinth
        position={[-7.25, 15.14, -157]}
        number={4}
        material={stone}
        glow={glow}
        beacon={beacon}
        glass={glass}
      />

      {[
        [-6.9, 3.4, -43, 2.6, 6.2, 2.2, -0.14],
        [-4.4, 2.2, -48, 1.8, 4.1, 1.7, 0.18],
        [5.8, 4.1, -51, 2.2, 7.4, 2.3, 0.11],
        [7.8, 2.6, -46, 1.5, 4.8, 1.8, -0.2],
        [-4.1, 9.3, -72, 1.6, 10.1, 3.8, 0.04],
        [5.05, 8.2, -77, 2.1, 8.2, 4.6, -0.08],
        [-4.5, 8.7, -91, 1.7, 7.8, 2.5, 0.08],
        [4.6, 10.3, -98, 1.8, 9.1, 2.9, -0.09],
      ].map(([x, y, z, w, h, d, rotation], index) => (
        <mesh
          key={index}
          material={index % 2 ? stone : darkStone}
          position={[x, y, z]}
          rotation={[0, rotation, 0]}
        >
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}

      {[-4.8, -1.75, 1.75, 4.8].map((x, index) => (
        <group key={x}>
          <mesh
            material={stone}
            position={[x, 13.1 + index * 0.18, -114.5]}
          >
            <boxGeometry args={[1.25, 8 + index * 0.35, 1.45]} />
          </mesh>
          <mesh
            material={glow}
            position={[x - 0.61, 13.1 + index * 0.18, -113.75]}
          >
            <boxGeometry args={[0.028, 7.2 + index * 0.35, 0.03]} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            material={stone}
            position={[side * 8.2, 25.7, -166]}
            rotation={[0, side * -0.025, 0]}
          >
            <boxGeometry args={[1.65, 21.2, 3.2]} />
          </mesh>
          <mesh material={glow} position={[side * 7.36, 25.7, -164.3]}>
            <boxGeometry args={[0.035, 19.8, 0.04]} />
          </mesh>
        </group>
      ))}
      <mesh material={stone} position={[0, 35.85, -166]}>
        <boxGeometry args={[18, 1.2, 3.2]} />
      </mesh>

      {[
        [-5.6, 18, -59, 2.2, 8.5, 2.6, 0.18],
        [5.1, 22, -92, 2.8, 11, 3.1, -0.2],
        [-4.8, 27, -126, 3.2, 13, 3.8, 0.12],
      ].map(([x, y, z, w, h, d, rotation], index) => (
        <mesh
          key={index}
          material={darkStone}
          position={[x, y, z]}
          rotation={[0.08, rotation, index % 2 ? -0.04 : 0.05]}
        >
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
    </group>
  );
}
