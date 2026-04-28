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
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
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

function AlbumCard({
  album, isPreviewing, onClick,
}: {
  album: AlbumWithPhotos
  isPreviewing: boolean
  onClick: () => void
}) {
  const cover = album.photos[0]
  const previewThumbs = album.photos.slice(0, 4)

  return (
    <button
      onClick={onClick}
      className="flex-none relative overflow-hidden group"
      style={{
        width: 'clamp(220px, 29vw, 380px)',
        height: 'clamp(260px, 54vh, 500px)',
      }}
      aria-label={album.title}
    >
      {/* Cover */}
      {cover ? (
        <img
          src={cover.url}
          alt={album.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 will-change-transform ${
            isPreviewing
              ? 'scale-[1.04] brightness-[0.5]'
              : 'group-hover:scale-[1.02] group-hover:brightness-[0.85]'
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-ink/30" />
      )}

      {/* Gradient base */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-400 ${
          isPreviewing ? 'opacity-100' : 'opacity-60'
        }`}
      />

      {/* Preview thumbnails — slide up on first click */}
      <div
        className={`absolute left-0 right-0 px-3 transition-all duration-400 ease-out ${
          isPreviewing
            ? 'bottom-[70px] opacity-100'
            : 'bottom-0 translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex gap-1">
          {previewThumbs.map(photo => (
            <div key={photo.id} className="flex-1 aspect-square overflow-hidden">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="font-body text-[9px] tracking-[0.35em] text-cream/50 text-center mt-2 uppercase">
          click para entrar
        </p>
      </div>

      {/* Album title + count */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-display text-xl md:text-2xl tracking-[0.2em] text-cream leading-tight">
          {album.title.toUpperCase()}
        </p>
        <p className="font-body text-[9px] tracking-[0.3em] text-cream/40 mt-1">
          {album.photos.length} {album.photos.length === 1 ? 'FOTO' : 'FOTOS'}
        </p>
      </div>
    </button>
  )
}

export default function GalleryClient({ albums }: { albums: AlbumWithPhotos[] }) {
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState<'albums' | 'album'>('albums')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null)
  const [lightboxClosing, setLightboxClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lightboxRef = useRef(lightbox)
  lightboxRef.current = lightbox

  useEffect(() => setMounted(true), [])

  const handleToggle = () => {
    if (expanded) {
      setView('albums')
      setPreviewId(null)
      setActiveAlbumId(null)
    }
    setExpanded(v => !v)
  }

  const handleAlbumClick = (albumId: string) => {
    if (previewId === albumId) {
      setActiveAlbumId(albumId)
      setView('album')
      setPreviewId(null)
    } else {
      setPreviewId(albumId)
    }
  }

  const handleBack = () => {
    setView('albums')
    setActiveAlbumId(null)
    setPreviewId(null)
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
                  <div className="flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-12 lg:px-24 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {albums.map(album => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        isPreviewing={previewId === album.id}
                        onClick={() => handleAlbumClick(album.id)}
                      />
                    ))}
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
                  <div className="flex gap-2 overflow-x-auto px-6 md:px-12 lg:px-24 pb-8 md:pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                          className="h-full w-auto block object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </button>
                    ))}
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
