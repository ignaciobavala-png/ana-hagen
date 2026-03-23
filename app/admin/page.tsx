import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LoginForm from './LoginForm'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl tracking-tight text-ink">ANA HAGEN</h1>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-ink/40 mt-1">
            Panel de administración
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-body text-xs tracking-[0.2em] uppercase text-ink/30 hover:text-ink/60 transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  )
}
