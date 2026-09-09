export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: false,
    });
    return Boolean(context);
  } catch {
    return false;
  }
}
