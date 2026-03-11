'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateHeroMedia } from '@/lib/actions/hero'
import { HeroConfig } from '@/types/database'

interface HeroUploaderProps {
  currentConfig: HeroConfig | null
}

export default function HeroUploader({ currentConfig }: HeroUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [mediaType, setMediaType] = useState<'video' | 'image'>(
    currentConfig?.media_type ?? 'video'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      setMediaType('image')
      setPreview(URL.createObjectURL(f))
    } else {
      setMediaType('video')
      setPreview('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setError('')
    setSuccess(false)
    setLoading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `hero-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('hero')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError('Error al subir el archivo. Verificá el tamaño y formato.')
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('hero').getPublicUrl(fileName)

    const result = await updateHeroMedia({
      media_type: mediaType,
      media_url: urlData.publicUrl,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Nuevo archivo (video MP4 o imagen JPG/PNG/WebP)
        </label>
        <input
          type="file"
          accept="video/mp4,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          required
          className="font-body text-sm text-ink/60 file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-ink file:text-cream file:font-body file:text-xs file:tracking-[0.2em] file:uppercase file:cursor-pointer"
        />
        <p className="font-body text-xs text-ink/30">
          Tamaño máximo: 50 MB para video, 5 MB para imagen.
        </p>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 object-cover border border-ink/10 mt-2"
          />
        )}
      </div>

      {error && <p className="font-body text-xs text-accent">{error}</p>}
      {success && (
        <p className="font-body text-xs text-green-700">
          Hero actualizado correctamente. Los cambios se verán en el sitio.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:bg-accent-dark transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? 'Subiendo...' : 'Actualizar hero'}
      </button>
    </form>
  )
}
