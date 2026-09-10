export type FirstFlightShot = "wide" | "material" | "contact" | "motion";

const REVIEW_RAIL: Record<Exclude<FirstFlightShot, "motion">, number> = {
  wide: 0.16,
  material: 0.2,
  contact: 0.28,
};

export type ReviewSwitch = "legacy" | "on" | "off";

export interface ReviewSettings {
  enabled: boolean;
  shot: FirstFlightShot;
  rail: number | null;
  scroll: number;
  still: boolean;
  bloom: boolean;
  shadows: ReviewSwitch;
  traveler: ReviewSwitch;
  backdrop: boolean;
  record: boolean;
}

const parseSwitch = (value: string | null): ReviewSwitch =>
  value === "on" || value === "off" ? value : "legacy";

export function getReviewSettings(
  search = window.location.search,
): ReviewSettings {
  const params = new URLSearchParams(search);
  const requestedScroll = params.get("scroll");
  const parsedScroll =
    requestedScroll === null ? Number.NaN : Number(requestedScroll);
  const enabled = params.get("review") === "first-flight";
  const requestedShot = params.get("shot");
  const shot: FirstFlightShot =
    requestedShot === "material" ||
    requestedShot === "contact" ||
    requestedShot === "motion"
      ? requestedShot
      : "wide";
  const still = shot !== "motion";

  return {
    enabled,
    shot,
    rail: still ? REVIEW_RAIL[shot] : null,
    scroll: Number.isFinite(parsedScroll)
      ? Math.min(1, Math.max(0, parsedScroll))
      : 0.23,
    still,
    bloom: params.get("bloom") === "on",
    shadows: parseSwitch(params.get("shadows")),
    traveler: parseSwitch(params.get("traveler")),
    backdrop: params.get("backdrop") !== "off",
    record: params.get("record") === "on",
  };
}
