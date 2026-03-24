'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { LiveConfig } from '@/types/database'

const LiveKitViewer = dynamic(() => import('./LiveKitViewer'), { ssr: false })

interface Props {
  initial: LiveConfig
}

const BAR_HEIGHTS = [35, 60, 45, 80, 55, 70, 40, 90, 50, 65, 75, 45, 85, 55, 40, 70, 60, 50, 80, 35]

export default function LiveViewer({ initial }: Props) {
  const [config, setConfig] = useState<LiveConfig>(initial)
  const [token, setToken] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('live-config')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_config', filter: 'id=eq.1' },
        (payload) => {
          setConfig(payload.new as LiveConfig)
          if (!payload.new.is_live) {
            setJoined(false)
            setToken(null)
            setJoinError(false)
            setExpanded(false)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const joinStream = useCallback(async () => {
    setJoining(true)
    setJoinError(false)
    try {
      const res = await fetch('/api/livekit/viewer-token')
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.error) throw new Error()
      setToken(data.token)
      setJoined(true)
    } catch {
      setJoinError(true)
    } finally {
      setJoining(false)
    }
  }, [])

  /* ─── ESTADO OFFLINE: pestaña colapsable ─────────────────── */
  if (!config.is_live) {
    return (
      <div id="live" className="border-t border-cream/[0.14]">

        {/* Tab header — siempre visible */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-6 md:px-12 lg:px-24 py-3.5 hover:bg-white/[0.02] transition-colors duration-200 group"
          style={{ background: '#1f1f1f' }}
          aria-expanded={expanded}
        >
          {/* Punto rojo pulsante */}
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

          {/* Chevron */}
          <span
            className={`ml-auto text-cream/25 group-hover:text-cream/45 transition-all duration-300 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {/* Panel expandible */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-in-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 px-6 md:px-12 lg:px-24 py-12 md:py-24" style={{ background: '#1f1f1f' }}>

              {/* Fondo decorativo */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                aria-hidden="true"
              >
                <span className="font-display text-[clamp(5rem,18vw,14rem)] leading-none tracking-tight text-cream/[0.02] whitespace-nowrap">
                  EN VIVO
                </span>
              </div>

              {/* Texto */}
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

              {/* Visualizador decorativo */}
              <div className="relative z-10 flex items-end gap-1 h-20 md:h-36" aria-hidden="true">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-accent/15 animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`,
                      animationDuration: `${1.2 + (i % 5) * 0.3}s`,
                    }}
                  />
                ))}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-cream/5" />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
          </div>
        </div>
      </div>
    )
  }

  /* ─── ESTADO EN VIVO ─────────────────────────────────────── */
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

      {/* Player */}
      <div className="w-full bg-black relative" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>

        {!joined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6">
            <div className="flex items-end gap-1 h-12 opacity-30" aria-hidden="true">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.07).toFixed(2)}s`,
                    animationDuration: `${0.8 + (i % 4) * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="font-display text-[clamp(2rem,7vw,5rem)] leading-none tracking-tight text-cream">
                ANA HAGEN
              </p>
              <p className="font-body text-xs tracking-[0.4em] uppercase text-cream/55 mt-3">
                Transmisión en vivo
                {config.started_at && (
                  <> · {new Date(config.started_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            </div>

            {joinError ? (
              <div className="text-center">
                <p className="font-body text-xs text-cream/40 mb-3">No se pudo conectar. Intentá de nuevo.</p>
                <button onClick={joinStream} className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 hover:bg-accent-dark transition-colors">
                  Reintentar
                </button>
              </div>
            ) : (
              <button
                onClick={joinStream}
                disabled={joining}
                className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 hover:bg-accent-dark transition-colors duration-200 disabled:opacity-60 flex items-center gap-3"
              >
                {joining ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />Conectando...</>
                ) : 'VER TRANSMISIÓN'}
              </button>
            )}
          </div>
        )}

        {joined && token && livekitUrl && (
          <LiveKitViewer token={token} serverUrl={livekitUrl} />
        )}

        {joined && (!token || !livekitUrl) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-cream/55 text-xs tracking-widest uppercase">LiveKit no configurado</p>
          </div>
        )}
      </div>

      {joined && (
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-3 border-t border-cream/[0.14]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-body text-xs text-cream/55 tracking-wide">En vivo</span>
          </div>
          <button
            onClick={() => { setJoined(false); setToken(null) }}
            className="font-body text-xs text-cream/50 hover:text-cream/70 transition-colors"
          >
            Salir del stream
          </button>
        </div>
      )}
    </section>
  )
}
