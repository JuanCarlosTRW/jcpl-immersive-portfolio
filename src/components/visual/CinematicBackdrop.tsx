export function CinematicBackdrop() {
  return (
    <div className="cinematic-world" aria-hidden="true">
      <picture className="cinematic-plate cinematic-plate--entrance">
        <source
          media="(max-width: 760px)"
          srcSet="/images/ascent-entrance-mobile.webp"
        />
        <img
          src="/images/ascent-entrance.webp"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <picture className="cinematic-plate cinematic-plate--journey">
        <source
          media="(max-width: 760px)"
          srcSet="/images/ascent-journey-mobile.webp"
        />
        <img
          src="/images/ascent-journey.webp"
          alt=""
          decoding="async"
          loading="eager"
        />
      </picture>
      <picture className="cinematic-plate cinematic-plate--projects">
        <source
          media="(max-width: 760px)"
          srcSet="/images/ascent-projects-mobile.webp"
        />
        <img
          src="/images/ascent-projects.webp"
          alt=""
          decoding="async"
          loading="lazy"
        />
      </picture>
      <div className="cinematic-atmosphere" />
      <div className="cinematic-depth-lines" />
      <div className="cinematic-grain" />
    </div>
  );
}
