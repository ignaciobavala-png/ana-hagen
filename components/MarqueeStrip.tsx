const ITEMS = [
  'ANA HAGEN', '·', 'DJ', '·', 'BUENOS AIRES', '·',
  'MINIMAL TECHNO', '·', 'HOUSE', '·', 'TECHNO', '·',
  'ANA HAGEN', '·', 'UNDERGROUND', '·', 'ELECTRONIC', '·',
]

export default function MarqueeStrip() {
  return (
    <div className="bg-[#1e1e1e] border-y border-cream/[0.14] overflow-hidden py-3.5" aria-hidden="true">
      <div className="marquee-track select-none">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className={`font-display text-base tracking-[0.35em] ${
              item === '·' ? 'text-cream/55 mx-5' : 'text-cream/50'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
