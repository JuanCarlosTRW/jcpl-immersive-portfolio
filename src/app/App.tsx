import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { useExperience } from "../stores/experience";
import { usePreferences } from "../hooks/usePreferences";
import { EXPERIENCE } from "../experience/config";
import { resetRuntime, runtime } from "../experience/runtime";
import { Journey } from "../experience/Journey";
import { Frame } from "../components/ui/Frame";
import { Arrow } from "../components/ui/Arrow";
import { Index } from "../components/ui/Index";
import { ProjectArchive } from "../components/ui/ProjectArchive";
import { CinematicBackdrop } from "../components/visual/CinematicBackdrop";
import { SceneBoundary } from "./SceneBoundary";
import { supportsWebGL2 } from "../utils/webgl";
import { getReviewSettings } from "../experience/review";

const World = lazy(() => import("../scene/World"));

function Portfolio() {
  const review = getReviewSettings();
  usePreferences();
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const failed = useExperience((s) => s.rendererFailed);
  const [graphicsChecked, setGraphicsChecked] = useState(false);
  const start = useRef(performance.now());
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpToProjects = useRef(false);
  const ready = useCallback(() => {
    readyTimer.current = setTimeout(
      () => {
        if (useExperience.getState().phase === "initializing")
          useExperience.getState().setPhase("portal");
      },
      Math.max(
        0,
        EXPERIENCE.timing.initialization - (performance.now() - start.current),
      ),
    );
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (useExperience.getState().phase === "initializing")
        useExperience.getState().failRenderer();
    }, EXPERIENCE.timing.loadTimeout);
    const forceFailure =
      import.meta.env.DEV &&
      new URLSearchParams(location.search).has("renderer-failure");
    if (forceFailure || !supportsWebGL2())
      useExperience.getState().failRenderer();
    setGraphicsChecked(true);
    return () => {
      clearTimeout(timeout);
      if (readyTimer.current) clearTimeout(readyTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!review.enabled) return;
    runtime.entry = 1;
    runtime.scroll = review.scroll;
    const state = useExperience.getState();
    state.setQuality("high");
    state.setReducedMotion(review.still);
    state.setPhase("world");
    document.documentElement.dataset.reviewMode = "first-flight";
    document.documentElement.dataset.reviewShot = review.shot;
    return () => {
      delete document.documentElement.dataset.reviewMode;
      delete document.documentElement.dataset.reviewShot;
      delete document.documentElement.dataset.reviewReady;
      delete document.documentElement.dataset.reviewCamera;
    };
  }, [review.enabled, review.scroll, review.shot, review.still]);
  useEffect(() => {
    document.body.style.overflow = phase === "world" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);
  useEffect(() => {
    if (phase !== "entering") return;
    if (reduced || failed) {
      runtime.entry = 1;
      useExperience.getState().setPhase("world");
      return;
    }
    const tween = gsap.to(runtime, {
      entry: 1,
      duration: EXPERIENCE.timing.entry,
      ease: "power2.inOut",
      onComplete: () => useExperience.getState().setPhase("world"),
    });
    return () => {
      tween.kill();
    };
  }, [phase, reduced, failed]);
  const enter = () => {
    if (phase === "portal") useExperience.getState().setPhase("entering");
  };
  const restart = () => {
    resetRuntime();
    jumpToProjects.current = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    useExperience.getState().setPhase("portal");
    requestAnimationFrame(() => document.getElementById("enter")?.focus());
  };
  const visitProjects = () => {
    if (phase === "world")
      document
        .getElementById("projects")
        ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    else {
      jumpToProjects.current = true;
      enter();
    }
  };
  return (
    <div
      className={`experience phase-${phase} ${reduced ? "reduced-motion" : ""} ${failed ? "renderer-fallback" : ""} ${review.enabled ? `review-first-flight review-${review.still ? "still" : "motion"} ${review.backdrop ? "" : "review-isolated"}` : ""}`}
      data-review-shot={review.enabled ? review.shot : undefined}
    >
      <a
        className="skip-link"
        href="#projects"
        onClick={(event) => {
          event.preventDefault();
          jumpToProjects.current = true;
          runtime.entry = 1;
          useExperience.getState().setPhase("world");
        }}
      >
        Skip to the ClientGrowth case study
      </a>
      <div className="scene-container" aria-hidden="true">
        {graphicsChecked && !failed && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <World onReady={ready} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      <CinematicBackdrop />
      <div className="cinema-shade" aria-hidden="true" />
      <Frame restart={restart} />
      {phase !== "world" && (
        <main className="threshold" inert={phase !== "portal"}>
          <div className="threshold-copy">
            <p className="eyebrow">
              <span className="chapter-dash" /> IMMERSIVE PORTFOLIO / 2026
            </p>
            <h1 className="threshold-title">
              THE
              <br />
              <span>ASCENT</span>
            </h1>
            <div className="threshold-bottom">
              <p>
                Strategy, design and technology.
                <br />
                <span>Built as a world you can enter.</span>
              </p>
              <button
                className="enter-button"
                id="enter"
                onClick={enter}
                onPointerEnter={() => {
                  runtime.hover = 1;
                }}
                onPointerLeave={() => {
                  runtime.hover = 0;
                }}
                onFocus={() => {
                  runtime.hover = 1;
                }}
                onBlur={() => {
                  runtime.hover = 0;
                }}
              >
                ENTER{" "}
                <span className="button-circle">
                  <Arrow />
                </span>
              </button>
            </div>
          </div>
          <div className="portal-coordinate" aria-hidden="true">
            <span className="coordinate-cross">+</span>
            <span>
              00 — THE THRESHOLD
              <br />
              <small>THE BEGINNING OF EVERYTHING</small>
            </span>
          </div>
          {failed && (
            <p className="fallback-note" role="status">
              The 3D experience is unavailable on this device. Enter to explore
              the portfolio in a lighter view.
            </p>
          )}
        </main>
      )}
      {phase === "world" && (
        <Journey
          jumpToProjects={jumpToProjects.current}
          reviewProgress={review.enabled ? review.scroll : null}
        />
      )}
      {phase === "initializing" && (
        <div className="initialization" role="status">
          <div className="init-mark" aria-hidden="true">
            /
          </div>
          <span>INITIALIZING</span>
          <div className="init-line">
            <i />
          </div>
          <small>THE ASCENT</small>
        </div>
      )}
      {phase === "entering" && (
        <div className="entry-caption" role="status">
          CROSS THE THRESHOLD.
        </div>
      )}
      <Index visitProjects={visitProjects} />
      <ProjectArchive />
      {import.meta.env.DEV &&
        new URLSearchParams(location.search).has("debug") && (
          <output id="performance-readout" className="performance-readout">
            {failed
              ? "WebGL unavailable · semantic fallback"
              : "Measuring rendering performance…"}
          </output>
        )}
    </div>
  );
}

export function App() {
  // Viewport harness stays out of production. The iframe gives CSS and Canvas a real narrow viewport.
  if (import.meta.env.DEV && new URLSearchParams(location.search).has("qa")) {
    const width = Number(new URLSearchParams(location.search).get("qa")) || 390;
    return (
      <div className="qa-harness">
        <p>
          Responsive QA · {width}px <a href="/?qa=390">Mobile</a>{" "}
          <a href="/?qa=1024">Laptop</a> <a href="/">Desktop</a>
        </p>
        <iframe
          title="Portfolio viewport test"
          src="/?debug"
          style={{ width, height: width < 760 ? 844 : 768 }}
        />
      </div>
    );
  }
  return <Portfolio />;
}
