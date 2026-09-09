import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { noiseGLSL } from "../shaders/noise";

export function useStoneMaterial(color = "#25282b", metalness = 0.72) {
  return useMemo(() => {
    const material = new MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness,
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader =
        "varying vec3 vStonePosition;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvStonePosition = position;",
      );
      shader.fragmentShader =
        "varying vec3 vStonePosition;\n" + noiseGLSL + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        vec2 stoneUV = vStonePosition.xy * vec2(3.0, 1.8) + vStonePosition.z * 0.7;
        float grain = noise(stoneUV * 36.0);
        float vein = fbm(stoneUV * 1.6);
        float hairline = pow(1.0 - abs(sin(stoneUV.x * 3.0 + stoneUV.y * 1.7 + vein * 12.0)), 25.0);
        diffuseColor.rgb *= 0.6 + grain * 0.26 + vein * 0.42;
        diffuseColor.rgb += hairline * 0.028;
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (grain - 0.5) * 0.2, 0.1, 1.0);",
      );
    };
    material.customProgramCacheKey = () => "ascent-stone-v1";
    return material;
  }, [color, metalness]);
}
