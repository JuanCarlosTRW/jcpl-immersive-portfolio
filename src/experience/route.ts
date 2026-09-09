export function routeHeightAt(z: number) {
  if (z > -48) return 0.34;
  if (z > -68) return 0.34 + ((-z - 48) / 20) * 4.2;
  if (z > -86) return 4.54;
  if (z > -107) return 4.54 + ((-z - 86) / 21) * 4.65;
  if (z > -130) return 9.19;
  if (z > -151) return 9.19 + ((-z - 130) / 21) * 5.91;
  return 15.1;
}
