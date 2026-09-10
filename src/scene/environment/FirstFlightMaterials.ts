import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  Vector2,
} from "three";

const TEXTURES = [
  "/textures/first-flight/stair-stone-basecolor.webp",
  "/textures/first-flight/stair-stone-normal-gl.png",
  "/textures/first-flight/stair-stone-roughness.png",
  "/textures/first-flight/landing-rock-basecolor.webp",
  "/textures/first-flight/landing-rock-normal-gl.png",
  "/textures/first-flight/landing-rock-roughness.png",
] as const;

function configure(
  source: Texture,
  color: boolean,
  repeat: [number, number],
  anisotropy: number,
) {
  const texture = source.clone();
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

export interface FirstFlightMaterials {
  surface: MeshPhysicalMaterial;
  riser: MeshStandardMaterial;
  rock: MeshStandardMaterial;
  insert: MeshStandardMaterial;
}

export function useFirstFlightMaterials(): FirstFlightMaterials {
  const loaded = useTexture([...TEXTURES]);
  const maxAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );
  const textures = useMemo(
    () => [
      configure(loaded[0], true, [2.6, 1.4], Math.min(8, maxAnisotropy)),
      configure(loaded[1], false, [2.6, 1.4], Math.min(8, maxAnisotropy)),
      configure(loaded[2], false, [2.6, 1.4], Math.min(8, maxAnisotropy)),
      configure(loaded[3], true, [1.7, 1.7], Math.min(6, maxAnisotropy)),
      configure(loaded[4], false, [1.7, 1.7], Math.min(6, maxAnisotropy)),
      configure(loaded[5], false, [1.7, 1.7], Math.min(6, maxAnisotropy)),
    ],
    [loaded, maxAnisotropy],
  );

  const materials = useMemo<FirstFlightMaterials>(() => {
    const surface = new MeshPhysicalMaterial({
      color: "#d8d9d7",
      map: textures[0],
      normalMap: textures[1],
      normalScale: new Vector2(0.38, 0.38),
      roughnessMap: textures[2],
      roughness: 0.82,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.52,
      specularIntensity: 0.46,
    });
    surface.name = "firstFlightWetStone";

    const riser = new MeshStandardMaterial({
      color: "#949796",
      map: textures[0],
      normalMap: textures[1],
      normalScale: new Vector2(0.42, 0.42),
      roughnessMap: textures[2],
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.34,
    });
    riser.name = "firstFlightMatteRiser";

    const rock = new MeshStandardMaterial({
      color: "#c0c1bf",
      map: textures[3],
      normalMap: textures[4],
      normalScale: new Vector2(0.54, 0.54),
      roughnessMap: textures[5],
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.25,
      flatShading: true,
    });
    rock.name = "firstFlightAngularBasalt";

    const insert = new MeshStandardMaterial({
      color: "#4c3c2d",
      roughness: 0.48,
      metalness: 0.78,
      envMapIntensity: 0.45,
    });
    insert.name = "firstFlightBronzeInsert";

    return { surface, riser, rock, insert };
  }, [textures]);

  useEffect(
    () => () => {
      Object.values(materials).forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    },
    [materials, textures],
  );

  return materials;
}

useTexture.preload([...TEXTURES]);
