'use client'

export default function HeroCTA() {
  const handleClick = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      className="group relative inline-flex items-center gap-3 bg-cream text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 overflow-hidden transition-all duration-300 hover:pr-14"
    >
      <span className="relative z-10">BOOKING</span>
      <span
        className="absolute inset-0 bg-accent translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
        aria-hidden="true"
      />
      <span className="relative z-10 text-ink group-hover:text-cream transition-colors duration-300">
        →
      </span>
    </button>
  )
}
