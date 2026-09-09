// Animation-only values. GSAP and the render loop share these without a React render per frame.
export const runtime = {
  entry: 0,
  scroll: 0,
  hover: 0,
  pointerX: 0,
  pointerY: 0,
};

export function resetRuntime() {
  runtime.entry = 0;
  runtime.scroll = 0;
  runtime.hover = 0;
}
