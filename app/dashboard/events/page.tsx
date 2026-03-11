import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteEvent, toggleEventPublished } from '@/lib/actions/events'
import { Event } from '@/types/database'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select()
    .order('date', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl tracking-tight text-ink">Eventos</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-accent-dark transition-colors"
        >
          + Nueva fecha
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white border border-ink/10 p-12 text-center">
          <p className="font-body text-ink/40 text-sm">No hay eventos cargados.</p>
          <Link
            href="/dashboard/events/new"
            className="inline-block mt-4 font-body text-sm text-accent hover:underline"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/5">
          {events.map((event: Event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-6 min-w-0">
                <span className="font-body text-sm text-ink/50 shrink-0 w-28">
                  {formatDate(event.date)}
                </span>
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm text-ink truncate">
                    {event.venue}
                  </p>
                  <p className="font-body text-xs text-ink/40">{event.city}</p>
                </div>
                {event.flyer_url && (
                  <a
                    href={event.flyer_url}
                    target="_blank"
                    className="font-body text-xs text-ink/30 hover:text-accent shrink-0"
                  >
                    flyer ↗
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Toggle publicado */}
                <form
                  action={async () => {
                    'use server'
                    await toggleEventPublished(event.id, !event.published)
                  }}
                >
                  <button
                    type="submit"
                    className={`font-body text-xs tracking-[0.15em] uppercase px-3 py-1 border transition-colors ${
                      event.published
                        ? 'border-green-500/30 text-green-700 bg-green-50'
                        : 'border-ink/15 text-ink/30'
                    }`}
                  >
                    {event.published ? 'Publicado' : 'Oculto'}
                  </button>
                </form>

                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="font-body text-xs tracking-[0.15em] uppercase px-3 py-1 border border-ink/15 text-ink/50 hover:border-accent hover:text-accent transition-colors"
                >
                  Editar
                </Link>

                <form
                  action={async () => {
                    'use server'
                    await deleteEvent(event.id)
                  }}
                >
                  <button
                    type="submit"
                    className="font-body text-xs text-ink/20 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      if (!confirm('¿Eliminar este evento?')) e.preventDefault()
                    }}
                  >
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
