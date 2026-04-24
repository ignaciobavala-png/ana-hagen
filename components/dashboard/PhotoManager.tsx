'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addPhoto, deletePhoto, updatePhotoCaption } from '@/lib/actions/photos'
import { Photo } from '@/types/database'

export default function PhotoManager({ photos }: { photos: Photo[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')
    const supabase = createClient()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(`Subiendo ${i + 1} de ${files.length}...`)
      const ext = file.name.split('.').pop()
      const fileName = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) {
        setError(`Error al subir ${file.name}`)
        continue
      }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      await addPhoto(urlData.publicUrl)
    }

    setUploading(false)
    setProgress('')
    if (fileRef.current) fileRef.current.value = ''
    router.refresh()
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('¿Eliminar esta foto?')) return
    setPendingDelete(id)
    await deletePhoto(id, url)
    setPendingDelete(null)
    router.refresh()
  }

  const handleCaptionBlur = async (id: string, caption: string) => {
    await updatePhotoCaption(id, caption)
  }

  return (
    <div>
      {/* Upload */}
      <div className="mb-10 border border-ink/10 p-6 flex flex-col gap-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/50">
          Subir fotos nuevas
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleUpload}
          disabled={uploading}
          className="font-body text-sm text-ink/60 file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-ink file:text-cream file:font-body file:text-xs file:tracking-[0.2em] file:uppercase file:cursor-pointer disabled:opacity-50"
        />
        <p className="font-body text-xs text-ink/30">
          Formatos: JPG, PNG, WebP, AVIF · Podés seleccionar múltiples fotos a la vez.
        </p>
        {uploading && (
          <p className="font-body text-xs text-ink/60 animate-pulse">{progress}</p>
        )}
        {error && (
          <p className="font-body text-xs text-accent">{error}</p>
        )}
      </div>

      {/* Grid de fotos existentes */}
      {photos.length === 0 ? (
        <p className="font-body text-sm text-ink/40">No hay fotos todavía. Subí la primera.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="flex flex-col gap-2">
              <div className="relative group aspect-square overflow-hidden bg-ink/5">
                <img
                  src={photo.url}
                  alt={photo.caption ?? ''}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(photo.id, photo.url)}
                  disabled={pendingDelete === photo.id}
                  className="absolute top-2 right-2 bg-ink/80 text-cream font-body text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent disabled:opacity-50"
                >
                  {pendingDelete === photo.id ? '...' : '×'}
                </button>
              </div>
              <input
                type="text"
                defaultValue={photo.caption ?? ''}
                placeholder="Caption (opcional)"
                onBlur={e => handleCaptionBlur(photo.id, e.target.value)}
                className="font-body text-xs text-ink/60 border-b border-ink/10 bg-transparent pb-1 focus:outline-none focus:border-ink/30 placeholder:text-ink/25"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
