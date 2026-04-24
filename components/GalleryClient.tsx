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
      className={`fixed inset-0 flex items-center justify-center p-6 md:p-16 ${closing ? 'gallery-overlay-out' : 'gallery-overlay-in'}`}
      style={{ backgroundColor: '#111111', zIndex: 9999 }}
      onClick={onClose}
    >
      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 text-2xl select-none"
            aria-label="Anterior"
          >
            ←
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 text-2xl select-none"
            aria-label="Siguiente"
          >
            →
          </button>
        </>
      )}

      <div
        key={activeIndex}
        className={`relative flex flex-col items-center gap-5 max-w-5xl w-full ${closing ? 'gallery-photo-out' : 'gallery-photo-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 font-body text-[10px] tracking-[0.35em] uppercase text-cream/25 hover:text-cream/60 transition-colors duration-200"
        >
          cerrar ×
        </button>

        <img
          src={photos[activeIndex].url}
          alt={photos[activeIndex].caption ?? ''}
          className="max-h-[80vh] max-w-full object-contain"
          draggable={false}
        />

        <div className="flex items-center gap-6">
          {photos.length > 1 && (
            <span className="font-body text-[10px] tracking-[0.35em] text-cream/20">
              {String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
          )}
          {photos[activeIndex].caption && (
            <span className="font-body text-xs tracking-[0.25em] text-cream/40 uppercase">
              {photos[activeIndex].caption}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const activeRef = useRef(activeIndex)
  activeRef.current = activeIndex

  useEffect(() => { setMounted(true) }, [])

  const left = photos.filter((_, i) => i % 2 === 0)
  const right = photos.filter((_, i) => i % 2 === 1)

  const closeWithAnimation = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setActiveIndex(null)
    }, 200)
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
              className="relative py-16 md:py-24"
              style={{ background: 'linear-gradient(180deg, #171717 0%, #1f1f1f 100%)' }}
            >
              {/* Watermark */}
              <span
                className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none overflow-hidden"
                style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}
                aria-hidden="true"
              >03</span>

              {/* Header */}
              <div className="flex items-end justify-between mb-16 border-b border-cream/[0.14] pb-6 px-6 md:px-12 lg:px-24 relative z-10">
                <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
                  <ScrambleText text="FOTOS" />
                </h2>
                <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/50 mb-2">
                  Fotografía
                </span>
              </div>

              {/* Desktop: dos columnas asimétricas con offset */}
              <div className="px-6 md:px-12 lg:px-24 relative z-10">
                <div className="hidden md:flex gap-3 lg:gap-4 items-start">
                  <div className="flex flex-col gap-3 lg:gap-4 w-[57%]">
                    {left.map((photo, i) => {
                      const globalIndex = i * 2
                      return (
                        <button
                          key={photo.id}
                          onClick={() => setActiveIndex(globalIndex)}
                          className="block w-full overflow-hidden group relative cursor-zoom-in"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption ?? ''}
                            className="w-full object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-75"
                            loading="lazy"
                          />
                          <span className="absolute top-3 left-4 font-body text-[9px] tracking-[0.4em] text-cream/0 group-hover:text-cream/40 transition-colors duration-300 uppercase">
                            {String(globalIndex + 1).padStart(2, '0')}
                          </span>
                          {photo.caption && (
                            <span className="absolute bottom-3 left-4 right-4 font-body text-[10px] tracking-[0.25em] text-cream/0 group-hover:text-cream/60 transition-colors duration-300 uppercase text-left line-clamp-1">
                              {photo.caption}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-col gap-3 lg:gap-4 w-[43%] mt-24">
                    {right.map((photo, i) => {
                      const globalIndex = i * 2 + 1
                      return (
                        <button
                          key={photo.id}
                          onClick={() => setActiveIndex(globalIndex)}
                          className="block w-full overflow-hidden group relative cursor-zoom-in"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption ?? ''}
                            className="w-full object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-75"
                            loading="lazy"
                          />
                          <span className="absolute top-3 left-4 font-body text-[9px] tracking-[0.4em] text-cream/0 group-hover:text-cream/40 transition-colors duration-300 uppercase">
                            {String(globalIndex + 1).padStart(2, '0')}
                          </span>
                          {photo.caption && (
                            <span className="absolute bottom-3 left-4 right-4 font-body text-[10px] tracking-[0.25em] text-cream/0 group-hover:text-cream/60 transition-colors duration-300 uppercase text-left line-clamp-1">
                              {photo.caption}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden columns-2 gap-2">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setActiveIndex(i)}
                      className="break-inside-avoid mb-2 block w-full overflow-hidden group"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption ?? ''}
                        className="w-full object-cover transition-all duration-500 group-hover:brightness-75"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox via portal → siempre en document.body, sin restricciones de overflow/z-index */}
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
