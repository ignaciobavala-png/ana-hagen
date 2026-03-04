"use client";

export default function Hero() {
  const handleBookingScroll = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
      {/* Fullscreen YouTube background video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <iframe
          src="https://www.youtube-nocookie.com/embed/gugAI3m8p6g?autoplay=1&mute=1&loop=1&playlist=gugAI3m8p6g&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Hero background"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            transform: "translate(-50%, -50%) scale(1.5)",
            border: "none",
          }}
        />
      </div>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 60%, rgba(26,26,26,0.7) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Center content */}
      <div className="relative z-20 text-center max-w-5xl w-full">
        {/* Decorative top line */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-16 bg-cream/40" />
          <span className="font-body text-xs tracking-[0.4em] uppercase text-cream/60">
            DJ · Artist
          </span>
          <div className="h-px w-16 bg-cream/40" />
        </div>

        {/* Main title — outlined, stroke reforzado */}
        <h1
          className="font-display text-[clamp(4rem,11vw,8.5rem)] leading-none tracking-tight select-none"
          style={{
            color: "transparent",
            WebkitTextStroke: "3px #FAF7F2",
            textShadow: "0 0 40px rgba(250,247,242,0.15)",
          }}
        >
          ANA
          <br />
          <span className="relative inline-block">
            HAGEN
            {/* Accent underline */}
            <span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-accent -z-10"
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-sm md:text-base tracking-[0.3em] uppercase text-cream font-medium mt-6"
           style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          DJ &nbsp;·&nbsp; Buenos Aires &nbsp;·&nbsp; Minimal Techno &nbsp;·&nbsp; House &nbsp;·&nbsp; Techno
        </p>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={handleBookingScroll}
            className="group relative inline-flex items-center gap-3 bg-cream text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 overflow-hidden transition-all duration-300 hover:pr-14"
          >
            <span className="relative z-10">BOOKING</span>
            {/* Accent fill on hover */}
            <span
              className="absolute inset-0 bg-accent translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
              aria-hidden="true"
            />
            <span className="relative z-10 text-ink group-hover:text-cream transition-colors duration-300">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-6 md:right-12 flex flex-col items-center gap-2 z-20">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/40 rotate-90 origin-center mb-4">
          scroll
        </span>
        <div className="w-px h-12 bg-cream/30 animate-pulse" />
      </div>
    </section>
  );
}
