'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlbumWithPhotos, Photo } from '@/types/database'

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Lightbox({
  photos, activeIndex, closing, onClose, onPrev, onNext,
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
      style={{ backgroundColor: 'rgba(8,8,8,0.92)', zIndex: 9999, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        key={activeIndex}
        className={`flex flex-col items-center gap-5 px-4 ${closing ? 'gallery-photo-out' : 'gallery-photo-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={photos[activeIndex].url}
          alt={photos[activeIndex].caption ?? ''}
          className="block max-h-[80vh] max-w-[90vw] w-auto object-contain"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8)', imageOrientation: 'from-image' }}
          draggable={false}
        />
        {photos[activeIndex].caption && (
          <p className="font-body text-[10px] tracking-[0.3em] text-cream/40 uppercase">
            {photos[activeIndex].caption}
          </p>
        )}
        <div className="flex items-center gap-8">
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onPrev() }}
              className="font-body text-cream/30 hover:text-cream/70 transition-colors text-xl px-3"
              aria-label="Anterior"
            >←</button>
          )}
          <button
            onClick={onClose}
            className="font-body text-[10px] tracking-[0.35em] uppercase text-cream/25 hover:text-cream/55 transition-colors"
          >
            cerrar ×
          </button>
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onNext() }}
              className="font-body text-cream/30 hover:text-cream/70 transition-colors text-xl px-3"
              aria-label="Siguiente"
            >→</button>
          )}
        </div>
      </div>
    </div>
  )
}

function AlbumCard({ album, onClick }: { album: AlbumWithPhotos; onClick: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photo = album.photos[photoIndex]
  const multi = album.photos.length > 1

  const prev = () => setPhotoIndex(i => (i - 1 + album.photos.length) % album.photos.length)
  const next = () => setPhotoIndex(i => (i + 1) % album.photos.length)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter') onClick()
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
        if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      }}
      className="flex-none relative overflow-hidden cursor-pointer group"
      style={{ width: 'clamp(220px, 29vw, 380px)', height: 'clamp(260px, 54vh, 500px)' }}
      aria-label={`Abrir álbum ${album.title}`}
    >
      {/* Foto actual */}
      {photo ? (
        <img
          key={photoIndex}
          src={photo.url}
          alt={album.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ imageOrientation: 'from-image' }}
        />
      ) : (
        <div className="absolute inset-0 bg-ink/30" />
      )}

      {/* Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      {/* Flecha izquierda */}
      {multi && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center text-cream/40 hover:text-cream/95 transition-colors duration-200 bg-gradient-to-r from-black/50 to-transparent"
          aria-label="Foto anterior"
        >
          <span className="text-2xl leading-none select-none">‹</span>
        </button>
      )}

      {/* Flecha derecha */}
      {multi && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center text-cream/40 hover:text-cream/95 transition-colors duration-200 bg-gradient-to-l from-black/50 to-transparent"
          aria-label="Foto siguiente"
        >
          <span className="text-2xl leading-none select-none">›</span>
        </button>
      )}

      {/* Info inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Barras de progreso (≤10 fotos) o contador */}
        {multi && album.photos.length <= 10 && (
          <div className="flex gap-1 mb-3">
            {album.photos.map((_, i) => (
              <div
                key={i}
                className={`h-[2px] flex-1 rounded-full transition-colors duration-300 ${
                  i === photoIndex ? 'bg-cream/80' : 'bg-cream/20'
                }`}
              />
            ))}
          </div>
        )}
        {multi && album.photos.length > 10 && (
          <p className="font-body text-[9px] tracking-[0.3em] text-cream/40 mb-2">
            {photoIndex + 1} / {album.photos.length}
          </p>
        )}
        <p className="font-display text-xl md:text-2xl tracking-[0.2em] text-cream leading-tight">
          {album.title.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

export default function GalleryClient({ albums }: { albums: AlbumWithPhotos[] }) {
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState<'albums' | 'album'>('albums')
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null)
  const [lightboxClosing, setLightboxClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lightboxRef = useRef(lightbox)
  lightboxRef.current = lightbox
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const albumsScrollRef = useRef<HTMLDivElement>(null)
  const filmstripScrollRef = useRef<HTMLDivElement>(null)

  const stopAudio = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null }
  }

  const startAudio = (musicUrl: string) => {
    stopAudio()
    const audio = new Audio(musicUrl)
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio
    audio.play().catch(() => {})
    let step = 0
    fadeRef.current = setInterval(() => {
      step++
      if (audioRef.current) audioRef.current.volume = Math.min((step / 20) * 0.65, 0.65)
      if (step >= 20) { clearInterval(fadeRef.current!); fadeRef.current = null }
    }, 60)
  }

  const scrollStrip = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: 'smooth' })
  }

  useEffect(() => setMounted(true), [])

  // Cleanup de audio al desmontar
  useEffect(() => () => { stopAudio() }, [])

  const handleToggle = () => {
    if (expanded) {
      stopAudio()
      setView('albums')
      setActiveAlbumId(null)
    }
    setExpanded(v => !v)
  }

  const handleAlbumClick = (albumId: string) => {
    const musicUrl = albums.find(a => a.id === albumId)?.music_url
    if (musicUrl) startAudio(musicUrl)
    else stopAudio()
    setActiveAlbumId(albumId)
    setView('album')
  }

  const handleBack = () => {
    stopAudio()
    setView('albums')
    setActiveAlbumId(null)
  }

  const closeLightbox = useCallback(() => {
    setLightboxClosing(true)
    setTimeout(() => { setLightboxClosing(false); setLightbox(null) }, 200)
  }, [])

  const prevPhoto = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length } : null),
  [])

  const nextPhoto = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.photos.length } : null),
  [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxRef.current) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeLightbox, prevPhoto, nextPhoto])

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  const activeAlbum = albums.find(a => a.id === activeAlbumId)

  return (
    <>
      <div id="fotos" className="border-t border-cream/[0.14]" style={{ background: '#1f1f1f' }}>

        {/* Tab header */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center gap-4 px-6 md:px-12 lg:px-24 py-4 hover:bg-white/[0.02] transition-colors duration-200 group"
          style={{ background: '#1f1f1f' }}
          aria-expanded={expanded}
        >
          <span className="font-display text-2xl tracking-[0.3em] text-cream/70 group-hover:text-cream/90 transition-colors duration-200">
            FOTOS
          </span>
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/35 group-hover:text-cream/55 transition-colors duration-200">
            · {albums.length} {albums.length === 1 ? 'álbum' : 'álbumes'}
          </span>
          <span
            className={`ml-auto text-cream/25 group-hover:text-cream/45 transition-all duration-300 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <IconChevron />
          </span>
        </button>

        {/* Expandable panel */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-in-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div style={{ background: 'linear-gradient(180deg, #141414 0%, #1a1a1a 100%)' }}>

              {view === 'albums' ? (
                /* ── Albums grid ── */
                <div className="py-8 md:py-12">
                  <div className="relative group/albums">
                    <button
                      onClick={() => scrollStrip(albumsScrollRef, 'left')}
                      className="absolute left-0 top-0 bottom-6 z-10 w-10 md:w-14 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 bg-gradient-to-r from-[#141414]/80 to-transparent"
                      aria-label="Anterior"
                    >‹</button>
                    <div ref={albumsScrollRef} className="flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-12 lg:px-24 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {albums.map(album => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={() => handleAlbumClick(album.id)}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => scrollStrip(albumsScrollRef, 'right')}
                      className="absolute right-0 top-0 bottom-6 z-10 w-10 md:w-14 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 bg-gradient-to-l from-[#141414]/80 to-transparent"
                      aria-label="Siguiente"
                    >›</button>
                  </div>
                </div>
              ) : activeAlbum ? (
                /* ── Photo filmstrip ── */
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-6 md:px-12 lg:px-24 pt-6 pb-4">
                    <button
                      onClick={handleBack}
                      className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/40 hover:text-cream/80 transition-colors duration-200"
                    >
                      ← ÁLBUMES
                    </button>
                    <span className="text-cream/20">·</span>
                    <span className="font-display text-base md:text-lg tracking-[0.25em] text-cream/60">
                      {activeAlbum.title.toUpperCase()}
                    </span>
                  </div>

                  {/* Strip */}
                  <div className="relative">
                    <button
                      onClick={() => scrollStrip(filmstripScrollRef, 'left')}
                      className="absolute left-0 top-0 bottom-8 md:bottom-12 z-10 w-10 md:w-14 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 bg-gradient-to-r from-[#1a1a1a]/80 to-transparent"
                      aria-label="Anterior"
                    >‹</button>
                    <div ref={filmstripScrollRef} className="flex gap-2 overflow-x-auto px-6 md:px-12 lg:px-24 pb-8 md:pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {activeAlbum.photos.map((photo, i) => (
                        <button
                          key={photo.id}
                          onClick={() => setLightbox({ photos: activeAlbum.photos, index: i })}
                          className="flex-none cursor-zoom-in overflow-hidden group"
                          style={{ height: 'clamp(240px, 52vh, 460px)' }}
                          aria-label={photo.caption ?? `Foto ${i + 1}`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption ?? ''}
                            className="h-full w-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                            style={{ imageOrientation: 'from-image' }}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => scrollStrip(filmstripScrollRef, 'right')}
                      className="absolute right-0 top-0 bottom-8 md:bottom-12 z-10 w-10 md:w-14 flex items-center justify-center text-cream/20 hover:text-cream/70 transition-colors duration-200 bg-gradient-to-l from-[#1a1a1a]/80 to-transparent"
                      aria-label="Siguiente"
                    >›</button>
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        </div>

      </div>

      {mounted && lightbox && createPortal(
        <Lightbox
          photos={lightbox.photos}
          activeIndex={lightbox.index}
          closing={lightboxClosing}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />,
        document.body
      )}
    </>
  )
}
