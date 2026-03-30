'use client'

import { useState } from 'react'
import { Event } from '@/types/database'
import ScrambleText from './ScrambleText'

function formatDate(raw: string): { day: string; month: string; year: string } {
  const d = new Date(raw)
  if (!isNaN(d.getTime())) {
    return {
      day: d.getUTCDate().toString().padStart(2, '0'),
      month: d.toLocaleString('es-AR', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
      year: d.getUTCFullYear().toString(),
    }
  }
  return { day: raw, month: '', year: '' }
}

export default function DatesSection({ events }: { events: Event[] }) {
  const hasEvents = events.length > 0
  const [expanded, setExpanded] = useState(hasEvents)

  return (
    <div id="dates" className="border-t border-cream/[0.14]">

      {/* Tab header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-6 md:px-12 lg:px-24 py-4 hover:bg-white/[0.02] transition-colors duration-200 group"
        style={{ background: '#1f1f1f' }}
        aria-expanded={expanded}
      >
        <span className="font-display text-2xl tracking-[0.3em] text-cream/70 group-hover:text-cream/90 transition-colors duration-200">
          FECHAS
        </span>

        {hasEvents ? (
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/80 group-hover:text-accent transition-colors duration-200">
            · {events.length} {events.length === 1 ? 'show' : 'shows'}
          </span>
        ) : (
          <span className="font-body text-xs tracking-[0.25em] uppercase text-cream/35 group-hover:text-cream/55 transition-colors duration-200">
            · Próximamente
          </span>
        )}

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
          <div
            className="relative overflow-hidden py-16 md:py-24 px-6 md:px-12 lg:px-24"
            style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #171717 100%)' }}
          >
            {/* Watermark */}
            <span
              className="absolute -right-4 top-0 font-display leading-none text-cream/[0.03] select-none pointer-events-none"
              style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}
              aria-hidden="true"
            >01</span>

            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-cream/[0.14] pb-6">
                <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
                  <ScrambleText text="FECHAS" />
                </h2>
                <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/55 mb-2">
                  Próximos shows
                </span>
              </div>

              {!hasEvents ? (
                <div className="py-12 text-center">
                  <p className="font-display text-3xl md:text-4xl text-cream/50 tracking-wide">
                    PRÓXIMAMENTE NUEVAS FECHAS
                  </p>
                  <p className="font-body text-sm text-cream/40 mt-4 tracking-widest uppercase">
                    Seguí las redes para novedades
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {events.map((event) => {
                    const { day, month, year } = formatDate(event.date)
                    return (
                      <div
                        key={event.id}
                        className="group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[100px_1fr_auto] items-center gap-6 py-7 border-b border-cream/[0.08] hover:border-accent/40 transition-colors duration-300 cursor-default"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                        <div className="flex flex-col leading-none min-w-[70px]">
                          <span className="font-display text-[2rem] md:text-[2.8rem] leading-none text-accent group-hover:text-cream transition-colors duration-300">
                            {day}
                          </span>
                          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-cream/55 mt-1">
                            {month} {year}
                          </span>
                        </div>

                        <div className="flex items-center gap-5">
                          <div>
                            <p className="font-display text-base md:text-2xl tracking-wide leading-tight text-cream/80 group-hover:text-cream transition-colors duration-200">
                              {event.venue}
                            </p>
                            <p className="font-body text-xs text-cream/55 mt-1 tracking-[0.15em] uppercase">
                              {event.city}
                            </p>
                          </div>
                          {event.flyer_url && (
                            <a
                              href={event.flyer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 hidden md:block opacity-50 group-hover:opacity-100 transition-opacity"
                            >
                              <img
                                src={event.flyer_url}
                                alt={`Flyer ${event.venue}`}
                                className="h-14 w-10 object-cover border border-cream/10 group-hover:border-accent/50 transition-colors"
                              />
                            </a>
                          )}
                        </div>

                        {event.ticket_link ? (
                          <a
                            href={event.ticket_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-xs font-semibold tracking-[0.2em] uppercase border border-cream/20 px-5 py-3 text-cream/60 hover:bg-accent hover:border-accent hover:text-cream transition-all duration-200 whitespace-nowrap"
                          >
                            ENTRADAS
                          </a>
                        ) : (
                          <span className="font-body text-xs tracking-[0.2em] uppercase text-cream/50 px-5 py-3 border border-cream/[0.08]">
                            FREE
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
