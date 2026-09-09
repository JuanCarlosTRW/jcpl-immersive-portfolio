import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE } from "./config";
import { runtime } from "./runtime";
import { useExperience } from "../stores/experience";
import { Arrow } from "../components/ui/Arrow";

gsap.registerPlugin(ScrollTrigger);

export function Journey({ jumpToProjects }: { jumpToProjects: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const reduced = useExperience((s) => s.reducedMotion);
  useEffect(() => {
    const experience = root.current?.closest<HTMLElement>(".experience");
    const updateVisualWorld = (progress: number) => {
      const transition = Math.min(
        1,
        Math.max(0, (progress - 0.46) / (0.76 - 0.46)),
      );
      const eased = transition * transition * (3 - 2 * transition);
      root.current?.style.setProperty("--journey-progress", String(progress));
      experience?.style.setProperty(
        "--journey-opacity",
        String((1 - eased) * 0.96),
      );
      experience?.style.setProperty(
        "--projects-opacity",
        String(eased * 0.96),
      );
      experience?.style.setProperty(
        "--journey-scale",
        String(1.035 + progress * 0.07),
      );
      experience?.style.setProperty(
        "--projects-scale",
        String(1.085 - eased * 0.05),
      );
      experience?.style.setProperty(
        "--journey-offset",
        `${progress * -10}px`,
      );
    };
    updateVisualWorld(0);
    const context = gsap.context(() => {
      gsap.to(runtime, {
        scroll: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : EXPERIENCE.timing.scrub,
          onUpdate: (self) => {
            setChapter(self.progress < 0.32 ? 0 : self.progress < 0.72 ? 1 : 2);
            updateVisualWorld(self.progress);
          },
        },
      });
    }, root);
    const refresh = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (jumpToProjects) {
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "instant" });
        document
          .getElementById("projects-title")
          ?.focus({ preventScroll: true });
      } else
        document
          .getElementById("identity-title")
          ?.focus({ preventScroll: true });
    });
    return () => {
      context.revert();
      cancelAnimationFrame(refresh);
      experience?.style.removeProperty("--journey-opacity");
      experience?.style.removeProperty("--projects-opacity");
      experience?.style.removeProperty("--journey-scale");
      experience?.style.removeProperty("--projects-scale");
      experience?.style.removeProperty("--journey-offset");
    };
  }, [reduced, jumpToProjects]);
  return (
    <main ref={root} className="journey" id="journey">
      <section className="story-beat identity" aria-labelledby="identity-title">
        <div className="beat-content">
          <p className="eyebrow">
            <span className="chapter-dash" /> 01 / THE BEGINNING
          </p>
          <h1 id="identity-title" tabIndex={-1}>
            JUAN<span className="identity-hyphen">-</span>
            <br />
            CARLOS<span className="identity-dot">.</span>
          </h1>
          <p className="identity-disciplines">
            BRAND SYSTEMS
            <br />
            DIGITAL EXPERIENCES
            <br />
            <span>CREATIVE TECHNOLOGY</span>
          </p>
        </div>
      </section>
      <section
        className="story-beat progression"
        aria-labelledby="progression-title"
      >
        <div className="beat-content">
          <p className="eyebrow">THE IDEA IS TO KEEP MOVING.</p>
          <h2 id="progression-title">
            Strategy becomes
            <br />an <em>experience.</em>
          </h2>
          <p className="story-description">
            Ideas become systems.
            <br />
            Systems become worlds.
          </p>
        </div>
      </section>
      <section
        className="story-beat projects"
        id="projects"
        aria-labelledby="projects-title"
      >
        <div className="beat-content">
          <p className="eyebrow">
            <span className="chapter-dash" /> DESTINATION 01
          </p>
          <h2 id="projects-title" tabIndex={-1}>
            SELECTED
            <br />
            <em>WORK.</em>
          </h2>
          <p className="story-description">
            Ideas brought into the world.
            <br />
            And the thinking that got them there.
          </p>
          <button
            className="enter-button"
            onClick={() => useExperience.getState().setProjectOpen(true)}
          >
            ENTER THE ARCHIVE{" "}
            <span className="button-circle">
              <Arrow diagonal />
            </span>
          </button>
        </div>
      </section>
      <aside className="journey-indicator" aria-label="Journey progress">
        <span>0{chapter + 1}</span>
        <div className="progress-line">
          <i />
        </div>
        <span>03</span>
      </aside>
      <div className="chapter-readout" aria-hidden="true">
        <span>0{chapter + 1}</span>
        <p>{["ARRIVAL", "THE ASCENT", "SELECTED WORK"][chapter]}</p>
      </div>
    </main>
  );
}
