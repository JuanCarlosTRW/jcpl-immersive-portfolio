import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE } from "./config";
import { runtime } from "./runtime";
import { useExperience } from "../stores/experience";
import { Arrow } from "../components/ui/Arrow";

gsap.registerPlugin(ScrollTrigger);

const CASE_STAGES = [
  {
    number: "01",
    label: "CURRENT STATE",
    kicker: "CLIENTGROWTH / THE SIGNAL",
    title: (
      <>
        Growth is happening.
        <br />
        Clarity <em>isn’t.</em>
      </>
    ),
    description: (
      <>
        Campaigns, content, CRM and analytics all move —
        <br />
        but rarely in the same direction.
      </>
    ),
    details: ["FRAGMENTED CHANNELS", "UNCLEAR PRIORITIES", "LOST SIGNALS"],
  },
  {
    number: "02",
    label: "CORE PROBLEM",
    kicker: "CLIENTGROWTH / THE GAP",
    title: (
      <>
        Momentum resets
        <br />
        every <em>month.</em>
      </>
    ),
    description: (
      <>
        The team works hard, but every initiative behaves like a new beginning.
        <br />
        Activity exists. A repeatable growth system does not.
      </>
    ),
    details: ["ACTIVITY ≠ SYSTEM", "TOOLS ≠ STRATEGY", "TRAFFIC ≠ GROWTH"],
  },
  {
    number: "03",
    label: "THE SYSTEM",
    kicker: "CLIENTGROWTH / THE ARCHITECTURE",
    title: (
      <>
        One engine.
        <br />
        Four connected <em>layers.</em>
      </>
    ),
    description: (
      <>
        Positioning creates focus. Acquisition creates attention.
        <br />
        Conversion creates momentum. Learning compounds it.
      </>
    ),
    details: ["POSITIONING", "ACQUISITION", "CONVERSION", "LEARNING"],
  },
  {
    number: "04",
    label: "DREAM STATE",
    kicker: "CLIENTGROWTH / THE DESTINATION",
    title: (
      <>
        Every signal makes
        <br />
        the next move <em>smarter.</em>
      </>
    ),
    description: (
      <>
        A connected digital operating system — clear enough to run,
        <br />
        flexible enough to evolve and built to learn continuously.
      </>
    ),
    details: ["ONE DIRECTION", "VISIBLE PROGRESS", "COMPOUNDING INSIGHT"],
  },
] as const;

const CHAPTER_LABELS = [
  "ARRIVAL",
  "THE BRIEF",
  ...CASE_STAGES.map((stage) => stage.label),
  "CLIENTGROWTH",
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Journey({ jumpToProjects }: { jumpToProjects: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const reduced = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const experience = root.current?.closest<HTMLElement>(".experience");
    const updateVisualWorld = (progress: number) => {
      const ascent = clamp((progress - 0.23) / 0.65);
      const easedAscent = 1 - Math.pow(1 - ascent, 3);
      const transition = clamp((progress - 0.88) / 0.07);
      const easedTransition = transition * transition * (3 - 2 * transition);

      root.current?.style.setProperty("--journey-progress", String(progress));
      experience?.style.setProperty(
        "--journey-opacity",
        String((1 - easedTransition) * 0.96),
      );
      experience?.style.setProperty(
        "--projects-opacity",
        String(easedTransition * 0.96),
      );
      experience?.style.setProperty(
        "--journey-scale",
        String(1.035 + easedAscent * 0.52),
      );
      experience?.style.setProperty(
        "--journey-offset-x",
        `${easedAscent * -8.5}vw`,
      );
      experience?.style.setProperty(
        "--journey-offset-y",
        `${easedAscent * 7.5}vh`,
      );
      experience?.style.setProperty(
        "--projects-scale",
        String(1.1 - easedTransition * 0.065),
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
            const progress = self.progress;
            setChapter(
              progress < 0.12
                ? 0
                : progress < 0.26
                  ? 1
                  : progress < 0.42
                    ? 2
                    : progress < 0.57
                      ? 3
                      : progress < 0.73
                        ? 4
                        : progress < 0.88
                          ? 5
                          : 6,
            );
            updateVisualWorld(progress);
          },
        },
      });

      if (!reduced) {
        gsap.utils.toArray<HTMLElement>(".case-stage").forEach((section) => {
          const content = section.querySelector(".beat-content");
          if (!content) return;
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: EXPERIENCE.timing.scrub,
              },
            })
            .fromTo(
              content,
              { autoAlpha: 0, y: 65 },
              { autoAlpha: 1, y: 0, duration: 0.32, ease: "none" },
            )
            .to(content, { autoAlpha: 1, y: 0, duration: 0.38 })
            .to(content, {
              autoAlpha: 0,
              y: -45,
              duration: 0.3,
              ease: "none",
            });
        });
      }
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
      } else {
        document
          .getElementById("identity-title")
          ?.focus({ preventScroll: true });
      }
    });

    return () => {
      context.revert();
      cancelAnimationFrame(refresh);
      experience?.style.removeProperty("--journey-opacity");
      experience?.style.removeProperty("--projects-opacity");
      experience?.style.removeProperty("--journey-scale");
      experience?.style.removeProperty("--journey-offset-x");
      experience?.style.removeProperty("--journey-offset-y");
      experience?.style.removeProperty("--projects-scale");
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

      <section className="story-beat case-intro" aria-labelledby="case-intro-title">
        <div className="beat-content">
          <p className="eyebrow">SELECTED CASE STUDY / CLIENTGROWTH</p>
          <h2 id="case-intro-title">
            Follow the system.
            <br />
            Step by <em>step.</em>
          </h2>
          <p className="story-description">
            Scroll forward through the challenge,
            <br />
            the architecture and the dream state.
          </p>
        </div>
      </section>

      <div className="case-ascent" aria-label="ClientGrowth case study journey">
        {CASE_STAGES.map((stage, index) => (
          <section
            className={`story-beat case-stage case-stage--${index + 1}`}
            aria-labelledby={`case-stage-${index + 1}`}
            key={stage.number}
          >
            <div className="case-stage-pin">
              <div className="beat-content">
                <div className="case-stage-heading">
                  <p className="eyebrow">{stage.kicker}</p>
                  <span className="case-stage-number" aria-hidden="true">
                    {stage.number}
                  </span>
                </div>
                <h2 id={`case-stage-${index + 1}`}>{stage.title}</h2>
                <p className="story-description">{stage.description}</p>
                <div className="case-stage-details" aria-label={`${stage.label} details`}>
                  {stage.details.map((detail) => (
                    <span key={detail}>{detail}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section
        className="story-beat projects"
        id="projects"
        aria-labelledby="projects-title"
      >
        <div className="beat-content">
          <p className="eyebrow">
            <span className="chapter-dash" /> CASE STUDY 01
          </p>
          <p className="project-client">CLIENTGROWTH</p>
          <h2 id="projects-title" tabIndex={-1}>
            GROWTH,
            <br />
            <em>CONNECTED.</em>
          </h2>
          <p className="story-description">
            From fragmented activity to one digital growth system.
          </p>
          <button
            className="enter-button"
            onClick={() => useExperience.getState().setProjectOpen(true)}
          >
            OPEN THE CASE STUDY{" "}
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
        <span>07</span>
      </aside>

      {chapter > 1 && chapter < 6 && (
        <div className="case-route" aria-hidden="true">
          {CASE_STAGES.map((stage, index) => (
            <span
              className={index + 2 <= chapter ? "is-reached" : ""}
              key={stage.number}
            />
          ))}
        </div>
      )}

      <div className="chapter-readout" aria-hidden="true">
        <span>0{chapter + 1}</span>
        <p>{CHAPTER_LABELS[chapter]}</p>
      </div>
    </main>
  );
}
