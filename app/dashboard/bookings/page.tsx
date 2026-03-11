import { createServiceClient } from '@/lib/supabase/server'
import { markBookingRead } from '@/lib/actions/booking'
import { BookingRequest } from '@/types/database'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function BookingsPage() {
  const supabase = createServiceClient()
  const { data: bookings } = await supabase
    .from('booking_requests')
    .select()
    .order('created_at', { ascending: false })

  const unread = bookings?.filter((b: BookingRequest) => !b.read).length ?? 0

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-display text-5xl tracking-tight text-ink">Bookings</h1>
        {unread > 0 && (
          <span className="bg-accent text-cream font-body text-xs font-bold px-2 py-1">
            {unread} nuevos
          </span>
        )}
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white border border-ink/10 p-12 text-center">
          <p className="font-body text-ink/40 text-sm">No hay requests todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking: BookingRequest) => (
            <div
              key={booking.id}
              className={`bg-white border p-6 ${!booking.read ? 'border-accent/40' : 'border-ink/10'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-body font-semibold text-sm text-ink">{booking.name}</p>
                    {!booking.read && (
                      <span className="bg-accent text-cream font-body text-[10px] uppercase tracking-widest px-2 py-0.5">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${booking.email}`}
                    className="font-body text-xs text-accent hover:underline"
                  >
                    {booking.email}
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-body text-xs text-ink/30">{formatDate(booking.created_at)}</p>
                  <p className="font-body text-xs font-semibold text-ink/50 mt-1">
                    {booking.event_type}
                  </p>
                  {booking.event_date && (
                    <p className="font-body text-xs text-ink/30">{booking.event_date}</p>
                  )}
                </div>
              </div>

              <p className="font-body text-sm text-ink/70 whitespace-pre-line border-t border-ink/5 pt-3">
                {booking.message}
              </p>

              {!booking.read && (
                <form
                  action={async () => {
                    'use server'
                    await markBookingRead(booking.id)
                  }}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className="font-body text-xs tracking-[0.15em] uppercase text-ink/30 hover:text-ink transition-colors"
                  >
                    Marcar como leído
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
