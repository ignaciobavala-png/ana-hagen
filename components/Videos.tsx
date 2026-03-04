const VIDEO_IDS = [
  "SEHgRWobQVU",
  "h7KmYYeH7zw",
  "Sv6nqPmncFE",
  "cZZQ21lkjdI",
];

export default function Videos() {
  return (
    <section
      id="sets"
      className="bg-cream py-20 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-ink/10 pb-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-ink">
            SETS
          </h2>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-ink/30 mb-2">
            Videos
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {VIDEO_IDS.map((id, idx) => (
            <div key={id + idx} className="group flex flex-col gap-3">
              {/* Aspect ratio wrapper */}
              <div className="relative w-full aspect-video overflow-hidden bg-ink/5 border border-ink/10">
                {/* Orange corner accent */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 bg-accent z-10 pointer-events-none"
                  aria-hidden="true"
                />
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
                  title={`Ana Hagen set ${idx + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Label */}
              <div className="flex items-center justify-between">
                <span className="font-display text-lg tracking-wide text-ink/70">
                  SET {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-ink/30">
                  YouTube
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
