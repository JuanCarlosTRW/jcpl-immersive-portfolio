import { DESTINATIONS } from "../../experience/config";
import { useExperience } from "../../stores/experience";
import { Arrow } from "./Arrow";
import { Modal } from "./Modal";

export function Index({ visitProjects }: { visitProjects: () => void }) {
  const open = useExperience((s) => s.indexOpen);
  const close = () => useExperience.getState().setIndexOpen(false);
  return (
    <Modal
      open={open}
      title="WORLD INDEX"
      onClose={close}
      className="index-modal"
    >
      <p className="index-intro">
        A world in
        <br />
        <em>progression.</em>
      </p>
      <nav aria-label="Destinations">
        <ol className="destination-list">
          {DESTINATIONS.map((destination) => (
            <li key={destination.id}>
              {destination.available ? (
                <button
                  onClick={() => {
                    close();
                    visitProjects();
                  }}
                >
                  <span className="destination-number">
                    {destination.number}
                  </span>
                  <span>{destination.label}</span>
                  <Arrow diagonal />
                </button>
              ) : (
                <div className="unavailable">
                  <span className="destination-number">
                    {destination.number}
                  </span>
                  <span>{destination.label}</span>
                  <small>UNEXPLORED</small>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <p className="index-note">More of the world will unfold with time.</p>
    </Modal>
  );
}
