'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PlaylistTrack } from '@/types/database'
import { useSoundCloudWidget } from '@/lib/hooks/useSoundCloudWidget'
import ScrambleText from './ScrambleText'

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

/* ── Icons ── */
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
const IconRew = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z" />
  </svg>
)
const IconFwd = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
)
const IconShuffle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
  </svg>
)
const IconSpinner = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const CARD_GRADIENTS = [
  'from-[#2d1b4e] to-[#1a0d2e]',
  'from-[#1e1040] to-[#0d0820]',
  'from-[#2a1545] to-[#160b30]',
  'from-[#1d0e3d] to-[#110833]',
  'from-[#251348] to-[#130928]',
]

/* ── Keyframes globales del reproductor ── */
const MusicStyles = () => (
  <style>{`
    @keyframes eq { 0%,100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }
    @keyframes bleedIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
)

/* ── Equalizer animado (4 barras limpias) ── */
function Equalizer() {
  return (
    <div className="flex items-end gap-[3px] h-5">
        {[0, 0.18, 0.09, 0.27].map((delay, i) => (
          <div
            key={i}
            className="w-[3px] bg-accent rounded-full origin-bottom"
            style={{
              height: '100%',
              animation: `eq ${0.55 + i * 0.12}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
  )
}

export default function MusicPlayer({ tracks }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffled, setShuffled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const isFirstRender = useRef(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { state, load, toggle, seekTo } = useSoundCloudWidget('sc-widget')

  const currentTrack = tracks[currentIndex]
  const progress = state.duration > 0 ? (state.position / state.duration) * 100 : 0

  /* Cambio de track */
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!currentTrack) return
    setLoading(true)
    load(currentTrack.soundcloud_url, true)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Fin de carga */
  useEffect(() => {
    if (state.ready) setLoading(false)
  }, [state.ready])

  /* Autoplay siguiente */
  useEffect(() => {
    if (!state.isPlaying && state.position > 0 && state.duration > 0 && state.position >= state.duration - 500) {
      handleNext()
    }
  }, [state.isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Scroll carousel al card activo */
  useEffect(() => {
    const container = carouselRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLElement>('[data-card]')
    const card = cards[currentIndex]
    if (!card) return
    container.scrollTo({
      left: card.offsetLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2),
      behavior: 'smooth',
    })
  }, [currentIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => (i > 0 ? i - 1 : tracks.length - 1))
  }, [tracks.length])

  const handleNext = useCallback(() => {
    if (shuffled) {
      const next = Math.floor(Math.random() * (tracks.length - 1))
      setCurrentIndex(i => (next >= i ? next + 1 : next) % tracks.length)
    } else {
      setCurrentIndex(i => (i + 1 < tracks.length ? i + 1 : 0))
    }
  }, [tracks.length, shuffled])

  const handleTrackClick = useCallback((idx: number) => {
    if (idx === currentIndex) { toggle() } else { setCurrentIndex(idx) }
  }, [currentIndex, toggle])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    seekTo(((e.clientX - rect.left) / rect.width) * state.duration)
  }, [state.duration, seekTo])

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverTime(((e.clientX - rect.left) / rect.width) * state.duration)
  }, [state.duration])

  const handleSkip = useCallback((ms: number) => {
    const next = Math.max(0, Math.min(state.duration, state.position + ms))
    seekTo(next)
  }, [state.position, state.duration, seekTo])

  /* ── ESTADO VACÍO ── */
  if (!currentTrack) return (
    <section id="musica" data-reveal className="py-20 md:py-32 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #171717 100%)' }}>
      <span className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none" style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }} aria-hidden="true">03</span>
      <div className="px-6 md:px-12 lg:px-24 relative z-10">
        <div className="flex items-end justify-between mb-12 border-b border-cream/[0.14] pb-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
            <ScrambleText text="MUSIC" />
          </h2>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/50 mb-2">Selección de Ana</span>
        </div>
      </div>
      <div className="flex gap-4 md:gap-5 overflow-hidden px-6 md:px-12 lg:px-24">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="shrink-0 w-44 md:w-52" style={{ opacity: 1 - i * 0.15 }}>
            <div className="aspect-square bg-cream/[0.04] border border-cream/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-cream/10 flex items-center justify-center">
                <span className="translate-x-0.5 text-cream/50"><IconPlay size={18} /></span>
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
        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-cream/50">Ana está preparando su selección · Próximamente</p>
      </div>
    </section>
  )

  /* ── REPRODUCTOR ── */
  return (
    <section id="musica" className="py-20 md:py-28 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #171717 100%)' }}>
      <MusicStyles />

      {/* Franja accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent z-20" aria-hidden="true" />

      {/* Cover bleeding — arte del track activo, borroso al fondo */}
      {currentTrack.cover_url && (
        <div key={currentTrack.id} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <img
            src={currentTrack.cover_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(90px)',
              transform: 'scale(1.4)',
              animation: 'bleedIn 1.4s ease forwards',
              opacity: 0,
            }}
          />
          {/* Velo oscuro para que no tape el contenido */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,31,31,0.82) 0%, rgba(23,23,23,0.93) 100%)' }} />
        </div>
      )}

      {/* Watermark */}
      <span className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none" style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }} aria-hidden="true">03</span>

      {/* Header */}
      <div className="flex items-end justify-between mb-10 md:mb-12 border-b border-cream/[0.14] pb-6 px-6 md:px-12 lg:px-24 relative z-10">
        <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
          <ScrambleText text="MUSIC" />
        </h2>
        <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/50 mb-2">Selección de Ana</span>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-2 no-scrollbar px-[10vw] sm:px-6 md:px-12 lg:px-24"
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
              style={{ scrollSnapAlign: 'center' }}
              className={`group shrink-0 w-[80vw] sm:w-44 md:w-48 lg:w-56 text-left transition-all duration-300 focus:outline-none ${
                active ? 'opacity-100 scale-100' : 'opacity-40 hover:opacity-70 scale-[0.98]'
              }`}
            >
              <div
                className={`relative aspect-square overflow-hidden border transition-all duration-500 ${
                  active ? 'border-accent/50' : 'border-cream/10 group-hover:border-cream/20'
                }`}
                style={active && state.isPlaying ? { boxShadow: '0 8px 48px rgba(155,78,184,0.35)' } : undefined}
              >
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} flex items-center justify-center`}>
                    <span className="font-display text-[4rem] leading-none text-accent/20 select-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Overlay */}
                <div className={`absolute inset-0 bg-ink/70 flex items-center justify-center transition-opacity duration-300 ${
                  isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {isPlayingThis ? (
                    <Equalizer />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      <span className="translate-x-0.5 text-ink"><IconPlay size={22} /></span>
                    </div>
                  )}
                </div>

                {active && <div className="absolute top-0 right-0 w-3 h-3 bg-accent" aria-hidden="true" />}
              </div>

              <div className="mt-3">
                <p className={`font-display text-sm md:text-[15px] leading-snug tracking-wide truncate transition-colors duration-200 ${
                  active ? 'text-accent' : 'text-cream/50 group-hover:text-cream/80'
                }`}>
                  {track.title}
                </p>
                <p className="font-body text-[11px] text-cream/55 mt-1 truncate">{track.artist}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Player bar */}
      <div className="mt-10 px-6 md:px-12 lg:px-24 border-t border-cream/[0.14] pt-7">

        {/* Progress bar — zona de hit amplia */}
        <div
          className="w-full h-6 flex items-center cursor-pointer group relative mb-5"
          onClick={handleSeek}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
          role="slider"
          aria-label="Progreso de reproducción"
          aria-valuenow={progress}
        >
          {/* Track */}
          <div className="w-full h-[2px] bg-cream/[0.08] relative">
            {/* Fill */}
            <div className="h-full bg-accent transition-none" style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div
              className={`absolute top-1/2 w-2.5 h-2.5 rounded-full bg-accent -translate-y-1/2 -translate-x-1/2 transition-opacity duration-150 ${
                state.isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              style={{ left: `${progress}%` }}
            />
            {/* Hover time tooltip — solo desktop */}
            {hoverTime !== null && (
              <div
                className="hidden sm:block absolute -top-7 -translate-x-1/2 font-mono text-[10px] text-cream/70 bg-ink/80 px-1.5 py-0.5 pointer-events-none whitespace-nowrap"
                style={{ left: `${(hoverTime / state.duration) * 100}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>
        </div>

        {/* Controls + info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">

          {/* Track info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className={`font-body text-[10px] tracking-[0.35em] uppercase mb-1 ${state.isPlaying ? 'text-accent' : 'text-cream/50'}`}>
              {loading ? 'Cargando…' : state.isPlaying ? '▶ Reproduciendo' : 'En pausa'}
            </p>
            <p className="font-display text-xl md:text-2xl leading-tight tracking-wide text-cream truncate">
              {currentTrack.title}
            </p>
            <p className="font-body text-xs text-cream/60 mt-0.5 truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls — mobile: 2 filas / desktop: 1 fila */}
          <div className="flex flex-col gap-3 sm:gap-0 shrink-0">

            {/* Fila principal: prev | -15s | play | +15s | next */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-4">

              {/* Shuffle — solo desktop */}
              <button
                onClick={() => setShuffled(v => !v)}
                className={`hidden sm:block p-2 -m-2 transition-colors ${shuffled ? 'text-accent' : 'text-cream/35 hover:text-cream/70'}`}
                aria-label="Shuffle"
                title="Aleatorio"
              >
                <IconShuffle />
              </button>

              <button onClick={handlePrev} className="p-2 -m-2 text-cream/55 hover:text-cream/90 transition-colors" aria-label="Anterior">
                <IconPrev />
              </button>

              <button
                onClick={() => handleSkip(-15000)}
                className="flex items-center gap-0.5 p-2 -m-2 text-cream/45 hover:text-cream/80 transition-colors"
                aria-label="Retroceder 15 segundos"
              >
                <IconRew />
                <span className="font-mono text-[9px] leading-none">15</span>
              </button>

              <button
                onClick={toggle}
                disabled={loading}
                className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-accent hover:bg-accent-dark flex items-center justify-center transition-colors text-cream shrink-0 shadow-lg shadow-accent/30 disabled:opacity-70"
                aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {loading ? (
                  <IconSpinner size={20} />
                ) : (
                  <span className={state.isPlaying ? '' : 'translate-x-0.5'}>
                    {state.isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSkip(15000)}
                className="flex items-center gap-0.5 p-2 -m-2 text-cream/45 hover:text-cream/80 transition-colors"
                aria-label="Adelantar 15 segundos"
              >
                <span className="font-mono text-[9px] leading-none">15</span>
                <IconFwd />
              </button>

              <button onClick={handleNext} className="p-2 -m-2 text-cream/55 hover:text-cream/90 transition-colors" aria-label="Siguiente">
                <IconNext />
              </button>

              {/* Time — solo desktop */}
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <span className="font-mono text-[10px] text-cream/50 tabular-nums">{formatTime(state.position)}</span>
                <span className="font-mono text-[10px] text-cream/30">/</span>
                <span className="font-mono text-[10px] text-cream/50 tabular-nums">{state.duration > 0 ? formatTime(state.duration) : '--:--'}</span>
              </div>
            </div>

            {/* Fila secundaria — solo mobile: shuffle ←—→ tiempo */}
            <div className="flex items-center justify-between sm:hidden px-1">
              <button
                onClick={() => setShuffled(v => !v)}
                className={`p-2 -m-2 transition-colors ${shuffled ? 'text-accent' : 'text-cream/30'}`}
                aria-label="Shuffle"
              >
                <IconShuffle />
              </button>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-cream/50 tabular-nums">{formatTime(state.position)}</span>
                <span className="font-mono text-[10px] text-cream/30">/</span>
                <span className="font-mono text-[10px] text-cream/50 tabular-nums">{state.duration > 0 ? formatTime(state.duration) : '--:--'}</span>
              </div>
            </div>
          </div>

          {/* SoundCloud link — solo desktop */}
          <a
            href={currentTrack.soundcloud_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block font-body text-[10px] tracking-[0.2em] uppercase text-cream/45 hover:text-cream/80 transition-colors"
          >
            SoundCloud ↗
          </a>
        </div>
      </div>

      {/* Hidden SC iframe */}
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
