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
        <nav className="flex items-center gap-6 md:gap-8">
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
