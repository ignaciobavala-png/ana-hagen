'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveConfig } from '@/types/database'

interface Props {
  initial: LiveConfig
}

const BAR_HEIGHTS = [35, 60, 45, 80, 55, 70, 40, 90, 50, 65, 75, 45, 85, 55, 40, 70, 60, 50, 80, 35]

export default function LiveViewer({ initial }: Props) {
  const [config, setConfig] = useState<LiveConfig>(initial)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('live-config')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_config', filter: 'id=eq.1' },
        (payload) => {
          setConfig(payload.new as LiveConfig)
          if (!payload.new.is_live) setExpanded(false)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  /* ─── OFFLINE ─────────────────────────────────────────────── */
  if (!config.is_live || !config.youtube_id) {
    return (
      <div id="live" className="border-t border-cream/[0.14]">

        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-6 md:px-12 lg:px-24 py-4 hover:bg-white/[0.02] transition-colors duration-200 group"
          style={{ background: '#1f1f1f' }}
          aria-expanded={expanded}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500/70" />
          </span>
          <span className="font-display text-2xl tracking-[0.3em] text-cream/70 group-hover:text-cream/90 transition-colors duration-200">
            LIVE
          </span>
          <span className="font-body text-xs tracking-[0.25em] uppercase text-cream/35 group-hover:text-cream/55 transition-colors duration-200">
            · Próximamente
          </span>
          <span
            className={`ml-auto text-cream/25 group-hover:text-cream/45 transition-all duration-300 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-500 ease-in-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 px-6 md:px-12 lg:px-24 py-12 md:py-24" style={{ background: '#1f1f1f' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <span className="font-display text-[clamp(5rem,18vw,14rem)] leading-none tracking-tight text-cream/[0.02] whitespace-nowrap">
                  EN VIVO
                </span>
              </div>
              <div className="relative z-10 max-w-md">
                <p className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-4">Streaming en vivo</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-tight text-cream mb-5">
                  SINTONIZÁ<br />EN VIVO
                </h2>
                <p className="font-body text-sm text-cream/40 leading-relaxed max-w-xs">
                  Cuando Ana esté tocando, vas a poder ver y escuchar su set en tiempo real, directo desde esta página.
                </p>
                <a
                  href="https://www.instagram.com/anahagen__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-7 font-body text-xs font-semibold tracking-[0.2em] uppercase text-cream/55 hover:text-accent transition-colors duration-200 group"
                >
                  <span>Seguir en Instagram</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </a>
              </div>
              <div className="relative z-10 flex items-end gap-1 h-20 md:h-36" aria-hidden="true">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-accent/15 animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${(i * 0.08).toFixed(2)}s`, animationDuration: `${1.2 + (i % 5) * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
          </div>
        </div>
      </div>
    )
  }

  /* ─── EN VIVO ──────────────────────────────────────────────── */
  return (
    <section id="live" className="text-cream relative overflow-hidden" style={{ background: '#1f1f1f' }}>

      {/* Barra EN VIVO */}
      <div className="flex items-center gap-3 px-6 md:px-12 lg:px-24 py-3 bg-accent">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cream" />
        </span>
        <span className="font-display text-lg tracking-[0.25em] text-cream">EN VIVO</span>
        {config.stream_title && (
          <>
            <span className="text-cream/40">·</span>
            <span className="font-body text-sm text-cream/80">{config.stream_title}</span>
          </>
        )}
      </div>

      {/* YouTube embed */}
      <div className="w-full bg-black" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
        <iframe
          src={`https://www.youtube.com/embed/${config.youtube_id}?autoplay=1&rel=0`}
          title="Live stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </section>
  )
}
