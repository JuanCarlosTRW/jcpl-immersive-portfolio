import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, ShaderMaterial } from "three";
import { EXPERIENCE } from "../../experience/config";
import { useExperience } from "../../stores/experience";
import { seededRandom } from "../../utils/random";

const vertex = /* glsl */ `
uniform float uTime;
uniform float uDpr;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.075 + aSeed * 40.0) * 0.4;
  p.y += sin(uTime * 0.11 + aSeed * 60.0) * 0.5;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((30.0 + aSeed * 25.0) / -mv.z, 0.7, 2.4) * uDpr;
  vAlpha = (0.12 + aSeed * 0.35) * (1.0 - smoothstep(8.0, 100.0, -mv.z));
}`;
const fragment = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(0.7, 0.75, 0.78, (1.0 - smoothstep(0.05, 0.5, d)) * vAlpha);
}`;

export function Dust() {
  const quality = useExperience((s) => s.quality);
  const material = useRef<ShaderMaterial>(null);
  const count = EXPERIENCE.quality[quality].particles;
  const [positions, seeds] = useMemo(() => {
    const random = seededRandom(42);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.set(
        [(random() - 0.5) * 70, random() * 22, 22 - random() * 125],
        i * 3,
      );
      seeds[i] = random();
    }
    return [positions, seeds];
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: EXPERIENCE.quality[quality].dpr },
    }),
    [quality],
  );
  useFrame((_, delta) => {
    if (material.current && !useExperience.getState().reducedMotion)
      uniforms.uTime.value += Math.min(delta, 0.05);
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
