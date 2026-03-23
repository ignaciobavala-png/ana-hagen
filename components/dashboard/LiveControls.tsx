'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LiveConfig } from '@/types/database'
import { goLive, endLive } from '@/lib/actions/live'

const LiveKitBroadcast = dynamic(() => import('@/components/LiveKitBroadcast'), { ssr: false })

interface Props {
  initial: LiveConfig | null
}

export default function LiveControls({ initial }: Props) {
  const [config, setConfig] = useState<LiveConfig | null>(initial)
  const [title, setTitle] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  const handleGoLive = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/livekit/host-token', { method: 'POST' })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    const result = await goLive(title)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setToken(data.token)
    setConfig((c) => c ? { ...c, is_live: true, stream_title: title || null } : c)
    setLoading(false)
  }

  const handleEndLive = async () => {
    await endLive()
    setToken(null)
    setConfig((c) => c ? { ...c, is_live: false, stream_title: null } : c)
  }

  const isLive = config?.is_live

  if (!livekitUrl) {
    return (
      <div className="border border-ink/10 p-6 max-w-xl">
        <p className="font-body text-sm text-ink/50">
          LiveKit no está configurado. Agregá{' '}
          <code className="font-mono text-xs bg-ink/5 px-1">NEXT_PUBLIC_LIVEKIT_URL</code>,{' '}
          <code className="font-mono text-xs bg-ink/5 px-1">LIVEKIT_API_KEY</code> y{' '}
          <code className="font-mono text-xs bg-ink/5 px-1">LIVEKIT_API_SECRET</code> al{' '}
          <code className="font-mono text-xs bg-ink/5 px-1">.env.local</code>.
        </p>
      </div>
    )
  }

  // Stream activo y esta sesión lo inició
  if (isLive && token) {
    return (
      <LiveKitBroadcast
        token={token}
        serverUrl={livekitUrl}
        onEnd={handleEndLive}
      />
    )
  }

  // Stream activo pero desde otra sesión
  if (isLive) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <div className="flex items-center gap-3 bg-accent px-5 py-4">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cream" />
          </span>
          <span className="font-display text-xl tracking-[0.15em] text-cream">EN VIVO</span>
        </div>
        <button
          onClick={handleEndLive}
          className="bg-white border border-ink/20 text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:border-accent hover:text-accent transition-colors w-fit"
        >
          Terminar transmisión
        </button>
      </div>
    )
  }

  // Idle — formulario para empezar
  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/50">
          Título de la transmisión <span className="text-ink/30">(opcional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Live set @ Club X · Buenos Aires"
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p className="font-body text-xs text-accent">{error}</p>
      )}

      <button
        onClick={handleGoLive}
        disabled={loading}
        className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 hover:bg-accent-dark transition-colors duration-200 disabled:opacity-50 w-fit"
      >
        {loading ? 'Iniciando...' : 'Empezar transmisión'}
      </button>
    </div>
  )
}
