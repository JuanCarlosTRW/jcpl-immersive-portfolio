import { create } from "zustand";
import type { Quality } from "../experience/config";

export type Phase = "initializing" | "portal" | "entering" | "world";
interface ExperienceState {
  phase: Phase;
  quality: Quality;
  reducedMotion: boolean;
  rendererFailed: boolean;
  indexOpen: boolean;
  projectOpen: boolean;
  setPhase: (phase: Phase) => void;
  setQuality: (quality: Quality) => void;
  setReducedMotion: (reduced: boolean) => void;
  failRenderer: () => void;
  setIndexOpen: (open: boolean) => void;
  setProjectOpen: (open: boolean) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  phase: "initializing",
  quality:
    matchMedia("(max-width: 760px), (pointer: coarse)").matches ||
    navigator.hardwareConcurrency <= 4
      ? "low"
      : "high",
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  rendererFailed: false,
  indexOpen: false,
  projectOpen: false,
  setPhase: (phase) => set({ phase }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  failRenderer: () => set({ rendererFailed: true, phase: "portal" }),
  setIndexOpen: (indexOpen) => set({ indexOpen }),
  setProjectOpen: (projectOpen) => set({ projectOpen }),
}));
