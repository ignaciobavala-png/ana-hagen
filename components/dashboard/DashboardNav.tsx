'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard/events',   label: 'Eventos' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/videos',   label: 'Videos' },
  { href: '/dashboard/photos',   label: 'Fotos' },
  { href: '/dashboard/playlist', label: 'Playlist' },
  { href: '/dashboard/live',     label: 'En vivo' },
  { href: '/dashboard/hero',     label: 'Hero' },
  { href: '/dashboard/contact',  label: 'Contacto' },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`font-body text-xs tracking-[0.2em] uppercase transition-colors ${
              active
                ? 'text-accent font-semibold'
                : 'text-cream/60 hover:text-cream'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}
