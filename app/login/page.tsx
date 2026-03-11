'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl tracking-tight text-ink">ANA HAGEN</h1>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-ink/40 mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-4 hover:bg-accent-dark transition-colors duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
