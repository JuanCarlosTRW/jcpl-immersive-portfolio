import { MeshReflectorMaterial } from "@react-three/drei";
import { useMemo } from "react";
import { useExperience } from "../../stores/experience";
import { EXPERIENCE } from "../../experience/config";
import { noiseGLSL } from "../shaders/noise";

const floorVertex = /* glsl */ `
varying vec3 vWorld;
void main() { vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }
`;
const floorFragment = /* glsl */ `
varying vec3 vWorld;
${noiseGLSL}
void main() {
  vec2 p = vWorld.xz;
  float lines = smoothstep(0.965, 0.99, max(abs(fract(p.x * 0.24) - 0.5) * 2.0, abs(fract(p.y * 0.16) - 0.5) * 2.0));
  float stone = noise(p * 8.0) * 0.018 + noise(p * 0.7) * 0.012;
  float trail = exp(-abs(p.x) * 0.35) * exp(-abs(p.y - 2.0) * 0.11);
  float seam = exp(-abs(abs(p.x) - 3.8) * 110.0) * (1.0 - smoothstep(-45.0, 22.0, p.y));
  vec3 col = vec3(0.024, 0.027, 0.029) + stone + trail * 0.04;
  col *= 1.0 - lines * 0.45;
  col += vec3(0.32, 0.25, 0.15) * seam * 0.42;
  float haze = smoothstep(25.0, 115.0, length(p));
  col = mix(col, vec3(0.03, 0.038, 0.044), haze);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function Ground() {
  const quality = useExperience((s) => s.quality);
  const uniforms = useMemo(() => ({}), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -45]}>
        <planeGeometry args={[260, 320]} />
        <shaderMaterial
          vertexShader={floorVertex}
          fragmentShader={floorFragment}
          uniforms={uniforms}
        />
      </mesh>
      {quality === "high" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 8]}>
          <planeGeometry args={[95, 38]} />
          <MeshReflectorMaterial
            resolution={EXPERIENCE.quality.high.reflection}
            blur={[250, 80]}
            mixBlur={0.7}
            mixStrength={0.5}
            mirror={0.32}
            depthScale={0.18}
            minDepthThreshold={0.6}
            maxDepthThreshold={1.4}
            color="#171b1e"
            metalness={0.72}
            roughness={0.65}
            transparent
            opacity={0.42}
          />
        </mesh>
      )}
    </group>
  );
}
