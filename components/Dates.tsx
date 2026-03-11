import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types/database'

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

export default async function Dates() {
  let events: Event[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select()
      .eq('published', true)
      .order('date', { ascending: true })

    events = data ?? []
  } catch {
    // Si Supabase no está disponible, mostrar sección vacía
  }

  return (
    <section
      id="dates"
      className="bg-card text-ink py-20 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-ink/10 pb-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-ink">
            FECHAS
          </h2>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-ink/30 mb-2">
            Próximos shows
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-3xl md:text-4xl text-ink/30 tracking-wide">
              PRÓXIMAMENTE NUEVAS FECHAS
            </p>
            <p className="font-body text-sm text-ink/40 mt-4 tracking-widest uppercase">
              Seguí las redes para novedades
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-ink/10">
            {events.map((event) => {
              const { day, month, year } = formatDate(event.date)
              return (
                <div
                  key={event.id}
                  className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[120px_1fr_auto] items-center gap-6 py-7 hover:bg-ink/[0.03] transition-colors duration-150 -mx-4 px-4 rounded-sm"
                >
                  {/* Bloque de fecha */}
                  <div className="flex flex-col leading-none min-w-[60px]">
                    <span className="font-display text-[2.5rem] leading-none text-accent">
                      {day}
                    </span>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-ink/40 mt-1">
                      {month} {year}
                    </span>
                  </div>

                  {/* Venue + ciudad */}
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="font-display text-xl md:text-2xl tracking-wide leading-tight group-hover:text-accent transition-colors duration-150">
                        {event.venue}
                      </p>
                      <p className="font-body text-sm text-ink/40 mt-1 tracking-wide">
                        {event.city}
                      </p>
                    </div>
                    {/* Flyer thumbnail */}
                    {event.flyer_url && (
                      <a
                        href={event.flyer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 hidden md:block"
                      >
                        <img
                          src={event.flyer_url}
                          alt={`Flyer ${event.venue}`}
                          className="h-14 w-10 object-cover border border-ink/10 hover:border-accent transition-colors"
                        />
                      </a>
                    )}
                  </div>

                  {/* Link de entradas */}
                  {event.ticket_link ? (
                    <a
                      href={event.ticket_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs font-semibold tracking-[0.2em] uppercase border border-ink/20 px-5 py-3 hover:bg-accent hover:border-accent hover:text-cream transition-all duration-200 whitespace-nowrap"
                    >
                      ENTRADAS
                    </a>
                  ) : (
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-ink/30 px-5 py-3 border border-ink/10">
                      FREE
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
