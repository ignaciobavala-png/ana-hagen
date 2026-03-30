'use client'

import { useState } from 'react'
import { LiveConfig } from '@/types/database'
import { goLive, endLive } from '@/lib/actions/live'

function extractYouTubeId(input: string): string | null {
  const str = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = str.match(re)
    if (m) return m[1]
  }
  return null
}

interface Props {
  initial: LiveConfig | null
}

export default function LiveControls({ initial }: Props) {
  const [config, setConfig] = useState<LiveConfig | null>(initial)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoLive = async () => {
    const youtubeId = extractYouTubeId(youtubeUrl)
    if (!youtubeId) {
      setError('URL de YouTube inválida. Pegá el link del stream o el ID del video.')
      return
    }
    setLoading(true)
    setError('')
    const result = await goLive(title, youtubeId)
    if (result.error) {
      setError(result.error)
    } else {
      setConfig(c => c ? { ...c, is_live: true, stream_title: title || null, youtube_id: youtubeId } : c)
      setYoutubeUrl('')
      setTitle('')
    }
    setLoading(false)
  }

  const handleEndLive = async () => {
    await endLive()
    setConfig(c => c ? { ...c, is_live: false, stream_title: null, youtube_id: null } : c)
  }

  if (config?.is_live) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <div className="flex items-center gap-3 bg-accent px-5 py-4">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cream" />
          </span>
          <span className="font-display text-xl tracking-[0.15em] text-cream">EN VIVO</span>
          {config.stream_title && (
            <span className="font-body text-sm text-cream/80 ml-1">· {config.stream_title}</span>
          )}
        </div>
        {config.youtube_id && (
          <p className="font-body text-xs text-ink/40">
            YouTube ID: <code className="font-mono bg-ink/5 px-1">{config.youtube_id}</code>
          </p>
        )}
        <button
          onClick={handleEndLive}
          className="bg-white border border-ink/20 text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:border-accent hover:text-accent transition-colors w-fit"
        >
          Terminar transmisión
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/50">
          URL del stream en YouTube <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={youtubeUrl}
          onChange={e => { setYoutubeUrl(e.target.value); setError('') }}
          placeholder="https://youtube.com/live/abc123 o el ID del video"
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/50">
          Título <span className="text-ink/30">(opcional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Live set @ Club X · Buenos Aires"
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {error && <p className="font-body text-xs text-red-500">{error}</p>}

      <button
        onClick={handleGoLive}
        disabled={loading || !youtubeUrl.trim()}
        className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-10 py-4 hover:bg-accent-dark transition-colors duration-200 disabled:opacity-50 w-fit"
      >
        {loading ? 'Activando...' : 'Activar stream'}
      </button>
    </div>
  )
}
