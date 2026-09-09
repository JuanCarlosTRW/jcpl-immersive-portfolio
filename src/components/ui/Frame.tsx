import { useExperience } from "../../stores/experience";

export function Frame({ restart }: { restart: () => void }) {
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const transitioning = phase === "initializing" || phase === "entering";
  return (
    <>
      <header className="frame-header">
        <button
          className="wordmark"
          onClick={restart}
          aria-label="Return to The Ascent entrance"
          disabled={transitioning}
        >
          JC<span className="wordmark-slash">/</span>PL
          <span className="wordmark-period">.</span>
        </button>
        <span className="header-title eyebrow">
          THE ASCENT{" "}
          <span className="header-secondary">
            <span className="header-separator">/</span> PORTFOLIO
          </span>
        </span>
        <button
          className="index-toggle text-button"
          onClick={() => useExperience.getState().setIndexOpen(true)}
          disabled={transitioning}
        >
          INDEX{" "}
          <span className="index-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>
      <footer className="frame-footer">
        <span className="footer-location">
          JUAN-CARLOS <span>© {new Date().getFullYear()}</span>
        </span>
        <div className="scroll-hint" aria-hidden="true">
          {phase === "world" ? (
            <>
              <span className="scroll-mark" /> SCROLL TO ASCEND
            </>
          ) : (
            <>
              <span className="tiny-cross">+</span> A WORLD IN PROGRESSION
            </>
          )}
        </div>
        <button
          className="motion-toggle"
          onClick={() => useExperience.getState().setReducedMotion(!reduced)}
          aria-pressed={reduced}
          aria-label="Reduce motion"
          disabled={transitioning}
        >
          MOTION <span>{reduced ? "REDUCED" : "FULL"}</span>
          <span
            className={`motion-symbol ${reduced ? "still" : ""}`}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </footer>
    </>
  );
}
