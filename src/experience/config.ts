export const EXPERIENCE = {
  timing: {
    initialization: 1250,
    loadTimeout: 18000,
    entry: 5.4,
    ui: 0.65,
    scrub: 1.15,
  },
  colors: {
    void: "#060709",
    fog: "#101316",
    stone: "#222529",
    metal: "#5c6165",
    light: "#eee9df",
  },
  camera: {
    fov: 44,
    near: 0.1,
    far: 240,
    start: [7, 3, 22.5] as [number, number, number],
    aim: [-3.8, 6.2, 0] as [number, number, number],
    mobileStart: [4, 2.8, 28] as [number, number, number],
    mobileAim: [0, 6.5, 0] as [number, number, number],
    arrival: [0, 5, -20] as [number, number, number],
    arrivalAim: [0, 6, -68] as [number, number, number],
    project: [2, 4.5, -45] as [number, number, number],
    projectAim: [3, 5.5, -65] as [number, number, number],
    entryWaypoints: [
      [0.3, 4.6, 12],
      [0, 4.5, 2],
      [0, 4.8, -9],
    ] as [number, number, number][],
    entryAimWaypoints: [
      [0, 5.8, -10],
      [0, 5, -24],
    ] as [number, number, number][],
    worldWaypoints: [
      [-2.4, 6.6, -29],
      [-1.5, 5.8, -40],
    ] as [number, number, number][],
    worldAimWaypoints: [
      [3, 6, -69],
      [6, 6.2, -68],
    ] as [number, number, number][],
    entryFovExpansion: 8,
    mobileProjectPullback: 7,
    mobileProjectOffset: 1.6,
    mobileProjectAimOffset: 5.2,
    pointerTravel: 0.35,
  },
  portal: { radius: 3.05, spring: 8.15, bottom: 0.48, layers: 4, depth: 0.48 },
  quality: {
    high: { dpr: 1.5, particles: 1100, reflection: 512, bloom: true },
    low: { dpr: 1, particles: 380, reflection: 0, bloom: false },
  },
  performance: { sampleMs: 1500, warmupMs: 6000, slowFps: 32, slowSamples: 3 },
} as const;

export type Quality = keyof typeof EXPERIENCE.quality;

// Future destinations are data, not mounted environments. Only Projects ships in this slice.
export const DESTINATIONS = [
  { id: "projects", label: "Projects", number: "01", available: true },
  { id: "about", label: "About", number: "02", available: false },
  { id: "expertise", label: "Expertise", number: "03", available: false },
  { id: "experiments", label: "Experiments", number: "04", available: false },
  { id: "contact", label: "Contact", number: "05", available: false },
] as const;
