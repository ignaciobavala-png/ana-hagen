'use client'

import { useState, useRef } from 'react'
import { Video } from '@/types/database'

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
    <section id="sets" className="bg-[#0f0f0f] py-20 md:py-32 overflow-hidden">

      {/* Header */}
      <div className="flex items-end justify-between mb-12 border-b border-cream/[0.08] pb-6 px-6 md:px-12 lg:px-24">
        <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
          SETS
        </h2>
        <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/20 mb-2">
          Videos
        </span>
      </div>

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

                    {/* Custom controls overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => togglePause(video.youtube_id)}
                    >
                      {/* Pause/Play button — visible solo al hover */}
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
                    {/* Thumbnail */}
                    <img
                      src={thumbUrl}
                      alt={video.title || `Set ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-ink/50 group-hover:bg-ink/25 transition-colors duration-300" />

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-2xl shadow-accent/40">
                        <span className="translate-x-0.5 text-cream">
                          <IconPlay />
                        </span>
                      </div>
                    </div>

                    {/* Bottom gradient + set number */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ink/70 to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-4 font-display text-[10px] tracking-[0.4em] text-cream/40">
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
    </section>
  )
}
