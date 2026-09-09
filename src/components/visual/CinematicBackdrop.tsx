export function CinematicBackdrop() {
  const stages = [
    "ascent-stage-01.webp",
    "ascent-stage-02.webp",
    "ascent-stage-03.webp",
    "ascent-stage-04.webp",
    "ascent-stage-05.webp",
  ];

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
      {stages.map((stage, index) => (
        <picture
          className={`cinematic-plate cinematic-stage cinematic-stage--${index + 1}`}
          key={stage}
        >
          <img
            src={`/images/${stage}`}
            alt=""
            decoding="async"
            loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </picture>
      ))}
      <div className="cinematic-atmosphere" />
      <div className="cinematic-depth-lines" />
      <div className="cinematic-grain" />
    </div>
  );
}
