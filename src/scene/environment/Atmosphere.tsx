import { useMemo } from "react";
import { BackSide } from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "../../experience/runtime";

const vertex = /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fragment = /* glsl */ `
uniform float uReveal;
varying vec3 vDirection;
void main() {
  float horizon = exp(-abs(vDirection.y + 0.012) * 19.0);
  float backlight = pow(max(0.0, -vDirection.z), 8.0);
  vec3 night = vec3(0.004, 0.006, 0.009);
  vec3 air = vec3(0.043, 0.055, 0.064) * horizon;
  air += vec3(0.035, 0.043, 0.048) * horizon * backlight * uReveal;
  gl_FragColor = vec4(night + air, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function Atmosphere() {
  const uniforms = useMemo(() => ({ uReveal: { value: 0 } }), []);
  useFrame(() => {
    uniforms.uReveal.value = runtime.entry;
  });
  return (
    <mesh position={[0, 0, -30]}>
      <sphereGeometry args={[190, 24, 16]} />
      <shaderMaterial
        side={BackSide}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        depthWrite={false}
      />
    </mesh>
  );
}
