import { useEffect } from "react";
import { useExperience } from "../stores/experience";
import { runtime } from "../experience/runtime";

export function usePreferences() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () =>
      useExperience.getState().setReducedMotion(media.matches);
    const pointer = (event: PointerEvent) => {
      runtime.pointerX = (event.clientX / innerWidth - 0.5) * 2;
      runtime.pointerY = (event.clientY / innerHeight - 0.5) * 2;
    };
    const leave = () => {
      runtime.pointerX = 0;
      runtime.pointerY = 0;
    };
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    media.addEventListener("change", changed);
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      history.scrollRestoration = previousRestoration;
      media.removeEventListener("change", changed);
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
}
