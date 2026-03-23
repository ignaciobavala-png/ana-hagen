'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PlaylistTrack } from '@/types/database'
import { useSoundCloudWidget } from '@/lib/hooks/useSoundCloudWidget'

interface Props {
  tracks: PlaylistTrack[]
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function makeWidgetSrc(url: string) {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&buying=false&liking=false&download=false&sharing=false`
}

const IconPlay = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)
const IconPause = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)
const IconPrev = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
)
const IconNext = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
  </svg>
)

const WAVEFORM_HEIGHTS = [35, 60, 45, 80, 55, 70, 40, 90, 50, 65, 75, 45, 85, 55, 40]

const CARD_GRADIENTS = [
  'from-[#2d1b4e] to-[#1a0d2e]',
  'from-[#1e1040] to-[#0d0820]',
  'from-[#2a1545] to-[#160b30]',
  'from-[#1d0e3d] to-[#110833]',
  'from-[#251348] to-[#130928]',
]

export default function MusicPlayer({ tracks }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isFirstRender = useRef(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { state, load, toggle, seekTo } = useSoundCloudWidget('sc-widget')

  const currentTrack = tracks[currentIndex]
  const progress = state.duration > 0 ? (state.position / state.duration) * 100 : 0

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!currentTrack) return
    load(currentTrack.soundcloud_url, true)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!state.isPlaying && state.position > 0 && state.duration > 0 && state.position >= state.duration - 500) {
      handleNext()
    }
  }, [state.isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll carousel to active card
  useEffect(() => {
    const container = carouselRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLElement>('[data-card]')
    const card = cards[currentIndex]
    if (!card) return
    const containerLeft = container.getBoundingClientRect().left
    const cardLeft = card.getBoundingClientRect().left
    const scrollTo = container.scrollLeft + cardLeft - containerLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2)
    container.scrollTo({ left: scrollTo, behavior: 'smooth' })
  }, [currentIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => (i > 0 ? i - 1 : tracks.length - 1))
  }, [tracks.length])

  const handleNext = useCallback(() => {
    setCurrentIndex(i => (i + 1 < tracks.length ? i + 1 : 0))
  }, [tracks.length])

  const handleTrackClick = useCallback((idx: number) => {
    if (idx === currentIndex) { toggle() } else { setCurrentIndex(idx) }
  }, [currentIndex, toggle])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    seekTo(((e.clientX - rect.left) / rect.width) * state.duration)
  }, [state.duration, seekTo])

  /* ── ESTADO VACÍO ── */
  if (!currentTrack) return (
    <section id="musica" className="bg-ink py-20 md:py-32 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="flex items-end justify-between mb-12 border-b border-cream/10 pb-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
            ESCUCHÁ
          </h2>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/20 mb-2">
            Selección de Ana
          </span>
        </div>
      </div>

      {/* Placeholder cards */}
      <div className="flex gap-4 md:gap-5 overflow-hidden px-6 md:px-12 lg:px-24">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="shrink-0 w-44 md:w-52" style={{ opacity: 1 - i * 0.15 }}>
            <div className="aspect-square bg-cream/[0.04] border border-cream/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-cream/10 flex items-center justify-center">
                <span className="translate-x-0.5 text-cream/20"><IconPlay size={18} /></span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 bg-cream/[0.08] rounded-sm" style={{ width: `${60 + (i * 7) % 35}%` }} />
              <div className="h-2 bg-cream/[0.04] rounded-sm w-2/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 md:px-12 lg:px-24 mt-10 border-t border-cream/10 pt-6">
        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-cream/20">
          Ana está preparando su selección · Próximamente
        </p>
      </div>
    </section>
  )

  /* ── REPRODUCTOR ── */
  return (
    <section id="musica" className="bg-ink py-20 md:py-28 overflow-hidden">

      {/* Header */}
      <div className="flex items-end justify-between mb-10 md:mb-12 border-b border-cream/10 pb-6 px-6 md:px-12 lg:px-24">
        <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
          ESCUCHÁ
        </h2>
        <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/20 mb-2">
          Selección de Ana
        </span>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-4 md:gap-5 overflow-x-auto pb-2 px-6 md:px-12 lg:px-24 no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {tracks.map((track, idx) => {
          const active = idx === currentIndex
          const isPlayingThis = active && state.isPlaying

          return (
            <button
              key={track.id}
              data-card=""
              onClick={() => handleTrackClick(idx)}
              style={{ scrollSnapAlign: 'start' }}
              className={`group shrink-0 w-44 md:w-52 lg:w-56 text-left transition-all duration-300 focus:outline-none ${
                active ? 'opacity-100 scale-100' : 'opacity-40 hover:opacity-70 scale-[0.98]'
              }`}
            >
              {/* Cover image */}
              <div className={`relative aspect-square overflow-hidden border transition-colors duration-300 ${
                active ? 'border-accent/50' : 'border-cream/10 group-hover:border-cream/20'
              }`}>
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} flex items-center justify-center`}>
                    <span className="font-display text-[4rem] leading-none text-accent/20 select-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Overlay: play button or waveform */}
                <div className={`absolute inset-0 bg-ink/70 flex items-center justify-center transition-opacity duration-300 ${
                  isPlayingThis ? 'opacity-100' : active ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {isPlayingThis ? (
                    <div className="flex items-end gap-[3px] h-8">
                      {WAVEFORM_HEIGHTS.map((h, i) => (
                        <div
                          key={i}
                          className="w-[3px] bg-accent rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${(i * 0.06).toFixed(2)}s`,
                            animationDuration: `${0.6 + (i % 5) * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                      active ? 'bg-accent' : 'bg-cream'
                    }`}>
                      <span className={`translate-x-0.5 ${active ? 'text-cream' : 'text-ink'}`}>
                        <IconPlay size={22} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Active indicator corner */}
                {active && <div className="absolute top-0 right-0 w-3 h-3 bg-accent" aria-hidden="true" />}
              </div>

              {/* Track info */}
              <div className="mt-3">
                <p className={`font-display text-sm md:text-[15px] leading-snug tracking-wide truncate transition-colors duration-200 ${
                  active ? 'text-accent' : 'text-cream/50 group-hover:text-cream/80'
                }`}>
                  {track.title}
                </p>
                <p className="font-body text-[11px] text-cream/25 mt-1 truncate">{track.artist}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Player bar */}
      <div className="mt-10 px-6 md:px-12 lg:px-24 border-t border-cream/[0.08] pt-7">

        {/* Progress bar */}
        <div
          className="w-full h-px bg-cream/[0.08] cursor-pointer group relative mb-6"
          onClick={handleSeek}
          role="slider"
          aria-label="Progreso de reproducción"
          aria-valuenow={progress}
        >
          <div className="h-full bg-accent transition-none" style={{ width: `${progress}%` }} />
          <div
            className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-accent -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-5 md:gap-8">

          {/* Current track info */}
          <div className="min-w-0 flex-1">
            <p className={`font-body text-[10px] tracking-[0.35em] uppercase mb-1 ${state.isPlaying ? 'text-accent' : 'text-cream/20'}`}>
              {state.isPlaying ? '▶ Reproduciendo' : 'En pausa'}
            </p>
            <p className="font-display text-lg md:text-2xl leading-tight tracking-wide text-cream truncate">
              {currentTrack.title}
            </p>
            <p className="font-body text-xs text-cream/30 mt-0.5 truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={handlePrev} className="text-cream/25 hover:text-cream/70 transition-colors" aria-label="Anterior">
              <IconPrev />
            </button>

            <button
              onClick={toggle}
              className="w-12 h-12 rounded-full bg-accent hover:bg-accent-dark flex items-center justify-center transition-colors text-cream shrink-0 shadow-lg shadow-accent/20"
              aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
            >
              <span className={state.isPlaying ? '' : 'translate-x-0.5'}>
                {state.isPlaying ? <IconPause size={18} /> : <IconPlay size={18} />}
              </span>
            </button>

            <button onClick={handleNext} className="text-cream/25 hover:text-cream/70 transition-colors" aria-label="Siguiente">
              <IconNext />
            </button>
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <span className="font-mono text-[10px] text-cream/20 tabular-nums">{formatTime(state.position)}</span>
            <span className="font-mono text-[10px] text-cream/10">/</span>
            <span className="font-mono text-[10px] text-cream/20 tabular-nums">{state.duration > 0 ? formatTime(state.duration) : '--:--'}</span>
          </div>

          {/* SoundCloud link */}
          <a
            href={currentTrack.soundcloud_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block font-body text-[10px] tracking-[0.2em] uppercase text-cream/15 hover:text-cream/40 transition-colors"
          >
            SoundCloud ↗
          </a>
        </div>
      </div>

      {/* Hidden SoundCloud iframe */}
      {tracks.length > 0 && (
        <iframe
          id="sc-widget"
          src={makeWidgetSrc(tracks[0].soundcloud_url)}
          width="1"
          height="1"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0"
          aria-hidden="true"
          title="SoundCloud Player"
        />
      )}
    </section>
  )
}
