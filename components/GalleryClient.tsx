'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Photo } from '@/types/database'
import ScrambleText from './ScrambleText'

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Rotaciones determinísticas — varían lo suficiente para sentirse naturales
const ROTATIONS = [-2.8, 3.1, -1.4, 2.5, -3.6, 1.7, -2.2, 3.9, -1.1, 2.3, -3.2, 1.9]

function Lightbox({
  photos,
  activeIndex,
  closing,
  onClose,
  onPrev,
  onNext,
}: {
  photos: Photo[]
  activeIndex: number
  closing: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${closing ? 'gallery-overlay-out' : 'gallery-overlay-in'}`}
      style={{ backgroundColor: 'rgba(8, 8, 8, 0.82)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        key={activeIndex}
        className={`flex flex-col items-center gap-5 ${closing ? 'gallery-photo-out' : 'gallery-photo-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Polaroid flotante — no fullscreen */}
        <div
          className="bg-[#faf7f2] p-4 md:p-5 pb-14 md:pb-20 w-[78vw] max-w-sm md:max-w-md"
          style={{
            boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.5)',
            transform: 'rotate(0.5deg)',
          }}
        >
          <img
            src={photos[activeIndex].url}
            alt={photos[activeIndex].caption ?? ''}
            className="w-full object-contain block"
            style={{ maxHeight: '55vh' }}
            draggable={false}
          />
          {/* Área de inscripción */}
          <div className="flex items-center justify-between mt-2 md:mt-3 px-1">
            <span className="font-body text-[10px] tracking-[0.2em] text-ink/35 uppercase">
              {photos[activeIndex].caption ?? ''}
            </span>
            {photos.length > 1 && (
              <span className="font-body text-[9px] tracking-[0.3em] text-ink/25">
                {String(activeIndex + 1).padStart(2, '0')}/{String(photos.length).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Navegación y cerrar debajo del polaroid */}
        <div className="flex items-center gap-8">
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onPrev() }}
              className="font-body text-cream/30 hover:text-cream/70 transition-colors duration-200 text-xl select-none px-3"
              aria-label="Anterior"
            >←</button>
          )}
          <button
            onClick={onClose}
            className="font-body text-[10px] tracking-[0.35em] uppercase text-cream/25 hover:text-cream/55 transition-colors duration-200"
          >
            cerrar ×
          </button>
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onNext() }}
              className="font-body text-cream/30 hover:text-cream/70 transition-colors duration-200 text-xl select-none px-3"
              aria-label="Siguiente"
            >→</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState(false)
  const [revealKey, setRevealKey] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const activeRef = useRef(activeIndex)
  activeRef.current = activeIndex

  useEffect(() => { setMounted(true) }, [])

  // Cada vez que se abre la solapa, re-dispara las animaciones de caída
  useEffect(() => {
    if (!expanded) return
    const t = setTimeout(() => setRevealKey(k => k + 1), 180)
    return () => clearTimeout(t)
  }, [expanded])

  const closeWithAnimation = useCallback(() => {
    setClosing(true)
    setTimeout(() => { setClosing(false); setActiveIndex(null) }, 200)
  }, [])

  const prev = useCallback(() =>
    setActiveIndex(i => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length])

  const next = useCallback(() =>
    setActiveIndex(i => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeRef.current === null) return
      if (e.key === 'Escape') closeWithAnimation()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeWithAnimation, prev, next])

  useEffect(() => {
    document.body.style.overflow = activeIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeIndex])

  return (
    <>
      <div id="fotos" className="border-t border-cream/[0.14]" style={{ background: '#1f1f1f' }}>

        {/* Tab header */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center gap-4 px-6 md:px-12 lg:px-24 py-4 hover:bg-white/[0.02] transition-colors duration-200 group"
          style={{ background: '#1f1f1f' }}
          aria-expanded={expanded}
        >
          <span className="font-display text-2xl tracking-[0.3em] text-cream/70 group-hover:text-cream/90 transition-colors duration-200">
            FOTOS
          </span>
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/35 group-hover:text-cream/55 transition-colors duration-200">
            · {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </span>
          <span
            className={`ml-auto text-cream/25 group-hover:text-cream/45 transition-all duration-300 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <IconChevron />
          </span>
        </button>

        {/* Panel expandible */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-in-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div
              className="relative py-10 md:py-16"
              style={{ background: 'linear-gradient(180deg, #141414 0%, #1a1a1a 100%)' }}
            >
              {/* Watermark */}
              <span
                className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none"
                style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}
                aria-hidden="true"
              >03</span>

              {/* Grid de polaroids */}
              <div className="px-6 md:px-12 lg:px-20 relative z-10">
                <div
                  key={revealKey}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16"
                >
                  {photos.map((photo, i) => {
                    const rot = ROTATIONS[i % ROTATIONS.length]
                    return (
                      <button
                        key={photo.id}
                        onClick={() => setActiveIndex(i)}
                        className="polaroid-card polaroid-drop cursor-zoom-in text-left"
                        style={{
                          '--rot': `${rot}deg`,
                          animationDelay: `${i * 75}ms`,
                        } as React.CSSProperties}
                        aria-label={photo.caption ?? `Foto ${i + 1}`}
                      >
                        {/* Marco polaroid */}
                        <div
                          className="bg-[#faf7f2] p-3 md:p-4 pb-10 md:pb-14"
                          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)' }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption ?? ''}
                            className="w-full object-cover block"
                            loading="lazy"
                          />
                          {/* Área de inscripción (siempre presente, como polaroid real) */}
                          <div className="flex items-center justify-center h-4 md:h-6 mt-1">
                            {photo.caption && (
                              <span className="font-body text-[9px] md:text-[10px] tracking-[0.18em] text-ink/35 uppercase line-clamp-1">
                                {photo.caption}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox via portal */}
      {mounted && activeIndex !== null && createPortal(
        <Lightbox
          photos={photos}
          activeIndex={activeIndex}
          closing={closing}
          onClose={closeWithAnimation}
          onPrev={prev}
          onNext={next}
        />,
        document.body
      )}
    </>
  )
}
