import Link from 'next/link'
import LogoutButton from '@/components/dashboard/LogoutButton'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-ink text-cream px-6 md:px-12 py-4 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-display text-xl tracking-tight">
          ANA HAGEN <span className="text-accent">·</span> ADMIN
        </Link>
        <nav className="flex flex-wrap items-center gap-4 md:gap-6">
          <DashboardNav />
          <LogoutButton />
        </nav>
      </header>

      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
