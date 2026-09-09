import { useExperience } from "../../stores/experience";
import { Modal } from "./Modal";
import { Arrow } from "./Arrow";

const CASE_LAYERS = [
  {
    number: "01",
    title: "Positioning",
    copy: "A shared market point of view that gives every channel one direction.",
  },
  {
    number: "02",
    title: "Acquisition",
    copy: "Connected campaigns and content designed around the same audience signals.",
  },
  {
    number: "03",
    title: "Conversion",
    copy: "A clearer path from first attention to qualified opportunity.",
  },
  {
    number: "04",
    title: "Learning",
    copy: "A measurement loop that turns every result into the next decision.",
  },
] as const;

export function ProjectArchive() {
  const open = useExperience((s) => s.projectOpen);
  const close = () => useExperience.getState().setProjectOpen(false);

  return (
    <Modal
      open={open}
      title="01 / CLIENTGROWTH"
      onClose={close}
      className="archive-modal"
    >
      <span className="archive-status eyebrow">SELECTED CASE STUDY</span>
      <p className="archive-client">CLIENTGROWTH</p>
      <h2>
        From activity
        <br />
        to a <em>growth system.</em>
      </h2>
      <p className="archive-lead">
        A digital company with ambitious initiatives — but no single system
        connecting brand, acquisition, conversion and learning.
      </p>

      <div className="case-study-summary">
        <section>
          <span>THE PROBLEM</span>
          <p>
            Disconnected channels created noise, uneven handoffs and decisions
            without a shared source of truth.
          </p>
        </section>
        <section>
          <span>DREAM STATE</span>
          <p>
            One operating model where every signal sharpens the next campaign,
            experience and decision.
          </p>
        </section>
      </div>

      <div className="case-study-layers" aria-label="ClientGrowth system layers">
        {CASE_LAYERS.map((layer) => (
          <section key={layer.number}>
            <span>{layer.number}</span>
            <h3>{layer.title}</h3>
            <p>{layer.copy}</p>
          </section>
        ))}
      </div>

      <p className="archive-note">
        This concept case study focuses on the strategic system. No invented
        performance metrics are presented.
      </p>
      <button className="line-link" onClick={close}>
        BACK TO THE WORLD <Arrow />
      </button>
    </Modal>
  );
}
