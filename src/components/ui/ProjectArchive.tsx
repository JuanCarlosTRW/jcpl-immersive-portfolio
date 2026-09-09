import { useExperience } from "../../stores/experience";
import { Modal } from "./Modal";
import { Arrow } from "./Arrow";

export function ProjectArchive() {
  const open = useExperience((s) => s.projectOpen);
  const close = () => useExperience.getState().setProjectOpen(false);
  return (
    <Modal
      open={open}
      title="01 / PROJECT ARCHIVE"
      onClose={close}
      className="archive-modal"
    >
      <span className="archive-status eyebrow">IN PROGRESS</span>
      <h2>
        Good work
        <br />
        has a story.
      </h2>
      <p>The thinking behind the builds. The decisions behind the results.</p>
      <p className="archive-description">
        Selected case studies are being prepared for this destination.
      </p>
      <div
        className="case-study-outline"
        aria-label="Future case study structure"
      >
        <span>Problem</span>
        <span>Strategy</span>
        <span>Execution</span>
        <span>Result</span>
      </div>
      <button className="line-link" onClick={close}>
        BACK TO THE WORLD <Arrow />
      </button>
    </Modal>
  );
}
