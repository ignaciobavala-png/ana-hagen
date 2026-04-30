'use client'

export default function HeroCTA() {
  const handleClick = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      className="btn-breathe group relative inline-flex items-center gap-3 border border-cream/40 text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 overflow-hidden transition-all duration-300 hover:border-cream"
    >
      <span
        className="absolute inset-0 bg-cream/20 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
        aria-hidden="true"
      />
      <span className="relative z-10 group-hover:text-cream transition-colors duration-300">
        BOOKING
      </span>
      <span className="relative z-10 group-hover:text-cream transition-colors duration-300">
        →
      </span>
    </button>
  )
}
