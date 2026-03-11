import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardHome() {
  const supabase = createServiceClient()

  const [eventsResult, bookingsResult, subscribersResult] = await Promise.all([
    supabase.from('events').select('id, published', { count: 'exact' }),
    supabase.from('booking_requests').select('id, read', { count: 'exact' }),
    supabase.from('subscribers').select('id', { count: 'exact' }),
  ])

  const totalEvents = eventsResult.data?.length ?? 0
  const publishedEvents = eventsResult.data?.filter((e) => e.published).length ?? 0
  const totalBookings = bookingsResult.data?.length ?? 0
  const unreadBookings = bookingsResult.data?.filter((b) => !b.read).length ?? 0
  const totalSubscribers = subscribersResult.data?.length ?? 0

  const stats = [
    {
      label: 'Próximos eventos',
      value: publishedEvents,
      sub: `${totalEvents} totales`,
      href: '/dashboard/events',
    },
    {
      label: 'Bookings nuevos',
      value: unreadBookings,
      sub: `${totalBookings} totales`,
      href: '/dashboard/bookings',
      highlight: unreadBookings > 0,
    },
    {
      label: 'Suscriptores',
      value: totalSubscribers,
      sub: 'para notificaciones',
      href: null,
    },
  ]

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white border p-6 ${stat.highlight ? 'border-accent' : 'border-ink/10'}`}
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/40 mb-3">
              {stat.label}
            </p>
            <p className={`font-display text-5xl leading-none ${stat.highlight ? 'text-accent' : 'text-ink'}`}>
              {stat.value}
            </p>
            <p className="font-body text-xs text-ink/30 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/events/new"
          className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-accent-dark transition-colors"
        >
          + Nueva fecha
        </Link>
        <Link
          href="/dashboard/bookings"
          className="bg-white border border-ink/15 text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:border-accent hover:text-accent transition-colors"
        >
          Ver bookings {unreadBookings > 0 && `(${unreadBookings} nuevos)`}
        </Link>
        <Link
          href="/"
          target="_blank"
          className="bg-white border border-ink/15 text-ink font-body text-sm tracking-[0.2em] uppercase px-6 py-3 hover:border-ink/40 transition-colors"
        >
          Ver sitio →
        </Link>
      </div>
    </div>
  )
}
