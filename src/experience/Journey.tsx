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
            setChapter(self.progress < 0.28 ? 0 : self.progress < 0.75 ? 1 : 2);
            root.current?.style.setProperty(
              "--journey-progress",
              String(self.progress),
            );
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
            MARKETING
            <br />
            STRATEGY
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
            Every build.
            <br />A step <em>forward.</em>
          </h2>
          <p className="story-description">
            Curiosity becomes craft.
            <br />
            Craft becomes impact.
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
            EXPLORE PROJECTS{" "}
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
    </main>
  );
}
