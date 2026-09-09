import { noiseGLSL } from "./noise";

export const apertureVertex = /* glsl */ `
varying vec3 vPosition;
void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const apertureFragment = /* glsl */ `
uniform float uTime;
uniform float uEntry;
uniform float uHover;
varying vec3 vPosition;
${noiseGLSL}
void main() {
  vec2 p = vec2(vPosition.x / 6.1 + 0.5, vPosition.y / 11.2);
  vec2 q = p - vec2(0.56, 0.55);
  float radius = length(q * vec2(1.0, 0.8));
  float angle = atan(q.y, q.x);
  float warp = fbm(q * 5.0 + uTime * 0.012);
  float mist = fbm(vec2(angle * 1.2 + warp, radius * 8.0 - uTime * 0.025));
  float crescent = exp(-abs(length((p - vec2(0.70, 0.48)) * vec2(1.0, 0.62)) - 0.27) * 160.0);
  crescent *= smoothstep(0.37, 0.9, p.x + p.y * 0.35);
  float edge = smoothstep(0.30, 0.62, radius);
  vec3 color = vec3(0.008, 0.012, 0.018);
  color += vec3(0.13, 0.16, 0.18) * mist * edge * 0.75;
  color += vec3(0.58, 0.61, 0.63) * crescent * (0.65 + uHover * 0.45);
  float wisps = pow(max(0.0, 1.0 - abs(mist - 0.52) * 15.0), 4.0);
  color += vec3(0.1, 0.12, 0.13) * wisps * edge;
  float stars = step(0.9975, hash21(floor(p * 420.0))) * (0.3 + 0.2 * sin(uTime * 0.4 + p.y * 90.0));
  color += stars * (1.0 - smoothstep(0.1, 0.9, radius));
  float alpha = 1.0 - smoothstep(0.47, 0.69, uEntry);
  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
