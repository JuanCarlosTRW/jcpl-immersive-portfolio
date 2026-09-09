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
      document.documentElement.style.setProperty(
        "--pointer-shift-x",
        `${runtime.pointerX * -8}px`,
      );
      document.documentElement.style.setProperty(
        "--pointer-shift-y",
        `${runtime.pointerY * -5}px`,
      );
    };
    const leave = () => {
      runtime.pointerX = 0;
      runtime.pointerY = 0;
      document.documentElement.style.setProperty("--pointer-shift-x", "0px");
      document.documentElement.style.setProperty("--pointer-shift-y", "0px");
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
      document.documentElement.style.removeProperty("--pointer-shift-x");
      document.documentElement.style.removeProperty("--pointer-shift-y");
    };
  }, []);
}
