import Link from 'next/link'
import LogoutButton from '@/components/dashboard/LogoutButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <header className="bg-ink text-cream px-6 md:px-12 py-4 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-display text-xl tracking-tight">
          ANA HAGEN <span className="text-accent">·</span> ADMIN
        </Link>
        <nav className="flex flex-wrap items-center gap-4 md:gap-6">
          <Link
            href="/dashboard/events"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Eventos
          </Link>
          <Link
            href="/dashboard/bookings"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Bookings
          </Link>
          <Link
            href="/dashboard/videos"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Videos
          </Link>
          <Link
            href="/dashboard/photos"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Fotos
          </Link>
          <Link
            href="/dashboard/playlist"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Playlist
          </Link>
          <Link
            href="/dashboard/live"
            className="font-body text-xs tracking-[0.2em] uppercase text-accent hover:text-accent-dark transition-colors font-semibold"
          >
            En vivo
          </Link>
          <Link
            href="/dashboard/hero"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Hero
          </Link>
          <Link
            href="/dashboard/contact"
            className="font-body text-xs tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors"
          >
            Contacto
          </Link>
          <LogoutButton />
        </nav>
      </header>

      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
