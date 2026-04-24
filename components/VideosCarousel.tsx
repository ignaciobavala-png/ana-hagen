'use client'

import { useState, useRef } from 'react'
import { Video } from '@/types/database'
import ScrambleText from './ScrambleText'

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const IconPause = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

export default function VideosCarousel({ videos }: { videos: Video[] }) {
  const [expanded, setExpanded] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({})

  function activate(youtubeId: string) {
    setActiveId(youtubeId)
    setPaused(false)
  }

  function togglePause(youtubeId: string) {
    const iframe = iframeRefs.current[youtubeId]
    if (!iframe?.contentWindow) return
    if (paused) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*')
      setPaused(false)
    } else {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*')
      setPaused(true)
    }
  }

  return (
    <div id="sets" className="border-t border-cream/[0.14]" style={{ background: '#1f1f1f' }}>

      {/* Tab header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-6 md:px-12 lg:px-24 py-4 hover:bg-white/[0.02] transition-colors duration-200 group"
        style={{ background: '#1f1f1f' }}
        aria-expanded={expanded}
      >
        <span className="font-display text-2xl tracking-[0.3em] text-cream/70 group-hover:text-cream/90 transition-colors duration-200">
          SETS
        </span>

        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/35 group-hover:text-cream/55 transition-colors duration-200">
          · {videos.length} {videos.length === 1 ? 'video' : 'videos'}
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
            className="relative overflow-hidden py-16 md:py-24"
            style={{ background: 'linear-gradient(180deg, #171717 0%, #1f1f1f 100%)' }}
          >
            {/* Section number watermark */}
            <span
              className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none"
              style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}
              aria-hidden="true"
            >02</span>

            {/* Carousel */}
            <div
              className="flex gap-5 md:gap-6 overflow-x-auto pb-2 px-6 md:px-12 lg:px-24 no-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {videos.map((video, idx) => {
                const isActive = activeId === video.youtube_id
                const thumbUrl = `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`

                return (
                  <div
                    key={video.id}
                    style={{ scrollSnapAlign: 'start' }}
                    className="shrink-0 w-[82vw] sm:w-[58vw] md:w-[44vw] lg:w-[38vw] xl:w-[30vw] flex flex-col gap-3"
                  >
                    {/* Video card */}
                    <div
                      className="relative w-full bg-black border border-cream/[0.06] overflow-hidden"
                      style={{ aspectRatio: '16/9' }}
                    >
                      {isActive ? (
                        <>
                          <iframe
                            ref={el => { iframeRefs.current[video.youtube_id] = el }}
                            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1&autoplay=1&controls=0&enablejsapi=1&iv_load_policy=3`}
                            title={video.title || `Ana Hagen set ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            width="100%"
                            height="100%"
                            className="absolute inset-0 w-full h-full border-0"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => togglePause(video.youtube_id)}
                          >
                            <button
                              className="w-16 h-16 rounded-full bg-black/60 border border-cream/20 flex items-center justify-center text-cream opacity-0 hover:opacity-100 transition-opacity duration-200"
                              onClick={e => { e.stopPropagation(); togglePause(video.youtube_id) }}
                            >
                              {paused ? <IconPlay /> : <IconPause />}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          className="absolute inset-0 cursor-pointer group"
                          onClick={() => activate(video.youtube_id)}
                        >
                          <img
                            src={thumbUrl}
                            alt={video.title || `Set ${idx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-ink/50 group-hover:bg-ink/25 transition-colors duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-2xl shadow-black/40">
                              <span className="translate-x-0.5 text-ink">
                                <IconPlay />
                              </span>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ink/70 to-transparent pointer-events-none" />
                          <span className="absolute bottom-3 left-4 font-display text-[10px] tracking-[0.4em] text-cream/60">
                            SET {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <p className="font-display text-base md:text-lg tracking-wide text-cream/50">
                      {video.title || `SET ${String(idx + 1).padStart(2, '0')}`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
