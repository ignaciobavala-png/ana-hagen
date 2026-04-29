'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addPhoto, deletePhoto, updatePhotoCaption, assignPhotoToAlbum } from '@/lib/actions/photos'
import { createAlbum, deleteAlbum, updateAlbumMusic, removeAlbumMusic, getMusicUploadUrl } from '@/lib/actions/albums'
import { Photo, Album } from '@/types/database'

async function convertToMp3(file: File, onProgress: (pct: number) => void): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new AudioContext()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  audioCtx.close()

  const lame = await import('lamejs')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Mp3Encoder = lame.Mp3Encoder ?? (lame as any).default?.Mp3Encoder
  if (!Mp3Encoder) throw new Error('No se pudo cargar el encoder MP3')

  const numChannels = Math.min(audioBuffer.numberOfChannels, 2) as 1 | 2
  const encoder = new Mp3Encoder(numChannels, audioBuffer.sampleRate, 96)

  const left = audioBuffer.getChannelData(0)
  const right = numChannels === 2 ? audioBuffer.getChannelData(1) : null
  const total = left.length
  const CHUNK = 1152
  const chunks: Int8Array[] = []

  const toInt16 = (src: Float32Array, start: number, end: number): Int16Array => {
    const out = new Int16Array(end - start)
    for (let i = start; i < end; i++) {
      const s = Math.max(-1, Math.min(1, src[i]))
      out[i - start] = s < 0 ? s * 32768 : s * 32767
    }
    return out
  }

  for (let i = 0; i < total; i += CHUNK) {
    const end = Math.min(i + CHUNK, total)
    const encoded = encoder.encodeBuffer(
      toInt16(left, i, end),
      right ? toInt16(right, i, end) : undefined
    )
    if (encoded.length > 0) chunks.push(encoded)

    // yield every 50 chunks (~1.3s of audio) to keep UI responsive
    if ((i / CHUNK) % 50 === 0) {
      onProgress(Math.min(95, Math.round((i / total) * 95)))
      await new Promise<void>(r => setTimeout(r, 0))
    }
  }

  const flushed = encoder.flush()
  if (flushed.length > 0) chunks.push(flushed)
  onProgress(100)

  return new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' })
}


export default function PhotoManager({ photos, albums }: { photos: Photo[], albums: Album[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadAlbumId, setUploadAlbumId] = useState<string>('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [newAlbumTitle, setNewAlbumTitle] = useState('')
  const [creatingAlbum, setCreatingAlbum] = useState(false)
  const [albumError, setAlbumError] = useState('')
  const [uploadingMusicFor, setUploadingMusicFor] = useState<string | null>(null)
  const [musicStatus, setMusicStatus] = useState('')
  const [musicSuccess, setMusicSuccess] = useState<string | null>(null)
  const [musicError, setMusicError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    const supabase = createClient()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(`Subiendo ${i + 1} de ${files.length}...`)
      const ext = file.name.split('.').pop()
      const fileName = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage.from('photos').upload(fileName, file)
      if (error) { setUploadError(`Error al subir ${file.name}`); continue }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      await addPhoto(urlData.publicUrl, undefined, uploadAlbumId || null)
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

  const handleAssignAlbum = async (photoId: string, albumId: string) => {
    await assignPhotoToAlbum(photoId, albumId || null)
    router.refresh()
  }

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return
    setCreatingAlbum(true)
    setAlbumError('')
    const result = await createAlbum(newAlbumTitle)
    if ('error' in result) {
      setAlbumError(result.error as string)
    } else {
      setNewAlbumTitle('')
    }
    setCreatingAlbum(false)
    router.refresh()
  }

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el álbum "${title}"? Las fotos quedarán sin asignar.`)) return
    await deleteAlbum(id)
    router.refresh()
  }

  const handleUploadMusic = async (albumId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMusicFor(albumId)
    setMusicError('')

    // Try MP3 conversion to reduce size; fall back to original if it fails
    let uploadBlob: Blob | File = file
    let uploadExt = file.name.split('.').pop() ?? 'mp3'
    try {
      setMusicStatus('convirtiendo 0%')
      uploadBlob = await convertToMp3(file, pct => setMusicStatus(`convirtiendo ${pct}%`))
      uploadExt = 'mp3'
    } catch {
      setMusicStatus('subiendo original...')
    }

    // Get signed upload URL from server (bypasses RLS)
    setMusicStatus('subiendo...')
    const urlResult = await getMusicUploadUrl(albumId, uploadExt)
    if ('error' in urlResult) {
      setMusicError(urlResult.error as string)
      setUploadingMusicFor(null)
      setMusicStatus('')
      e.target.value = ''
      return
    }

    const supabase = createClient()
    const { error } = await supabase.storage
      .from('photos')
      .uploadToSignedUrl(urlResult.path, urlResult.token, uploadBlob)

    if (error) {
      setMusicError(`Error al subir música: ${error.message}`)
    } else {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(urlResult.path)
      await updateAlbumMusic(albumId, urlData.publicUrl)
      setMusicSuccess(albumId)
      setTimeout(() => setMusicSuccess(null), 3000)
      router.refresh()
    }

    setUploadingMusicFor(null)
    setMusicStatus('')
    e.target.value = ''
  }

  const handleRemoveMusic = async (albumId: string) => {
    await removeAlbumMusic(albumId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-12">

      {/* ── Álbumes ── */}
      <div>
        <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/50 mb-5">Álbumes</p>

        {albums.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {albums.map(album => (
              <div key={album.id} className="flex items-center justify-between border border-ink/10 px-3 py-2">
                <span className="font-body text-sm text-ink/70">{album.title}</span>
                <div className="flex items-center gap-4">
                  {/* Music status */}
                  {album.music_url ? (
                    <div className="flex items-center gap-2">
                      <span className={`font-body text-[10px] tracking-[0.15em] transition-colors duration-300 ${
                        musicSuccess === album.id ? 'text-green-600' : 'text-ink/40'
                      }`}>
                        {musicSuccess === album.id ? '✓ subida' : '♫ música asignada'}
                      </span>
                      <button
                        onClick={() => handleRemoveMusic(album.id)}
                        className="font-body text-[10px] text-ink/25 hover:text-accent transition-colors"
                        aria-label="Quitar música"
                      >×</button>
                    </div>
                  ) : (
                    <label className="font-body text-[10px] tracking-[0.15em] text-ink/30 hover:text-ink/60 cursor-pointer transition-colors">
                      {uploadingMusicFor === album.id ? musicStatus || '...' : '♫ + música'}
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/aac,audio/ogg,audio/wav,audio/*"
                        className="hidden"
                        onChange={e => handleUploadMusic(album.id, e)}
                        disabled={uploadingMusicFor === album.id}
                      />
                    </label>
                  )}
                  <button
                    onClick={() => handleDeleteAlbum(album.id, album.title)}
                    className="font-body text-xs text-ink/25 hover:text-accent transition-colors"
                    aria-label={`Eliminar álbum ${album.title}`}
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newAlbumTitle}
            onChange={e => setNewAlbumTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateAlbum()}
            placeholder="Nombre del álbum..."
            className="font-body text-sm text-ink/70 border-b border-ink/20 bg-transparent pb-1 focus:outline-none focus:border-ink/50 placeholder:text-ink/25 w-52"
          />
          <button
            onClick={handleCreateAlbum}
            disabled={creatingAlbum || !newAlbumTitle.trim()}
            className="font-body text-xs tracking-[0.2em] uppercase text-ink/40 hover:text-ink disabled:opacity-30 transition-colors border-b border-ink/20 pb-1"
          >
            {creatingAlbum ? '...' : '+ crear'}
          </button>
        </div>
        {albumError && <p className="font-body text-xs text-accent mt-2">{albumError}</p>}
        {musicError && <p className="font-body text-xs text-accent mt-2">{musicError}</p>}
      </div>

      {/* ── Upload ── */}
      <div className="border border-ink/10 p-6 flex flex-col gap-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/50">Subir fotos nuevas</p>

        {albums.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="font-body text-xs text-ink/40">Álbum:</label>
            <select
              value={uploadAlbumId}
              onChange={e => setUploadAlbumId(e.target.value)}
              className="font-body text-sm text-ink/70 bg-transparent border-b border-ink/20 pb-1 focus:outline-none focus:border-ink/50"
            >
              <option value="">Sin álbum</option>
              {albums.map(album => (
                <option key={album.id} value={album.id}>{album.title}</option>
              ))}
            </select>
          </div>
        )}

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
        {uploading && <p className="font-body text-xs text-ink/60 animate-pulse">{progress}</p>}
        {uploadError && <p className="font-body text-xs text-accent">{uploadError}</p>}
      </div>

      {/* ── Fotos ── */}
      {photos.length === 0 ? (
        <p className="font-body text-sm text-ink/40">No hay fotos todavía.</p>
      ) : (
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/50 mb-5">
            Fotos ({photos.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="flex flex-col gap-2">
                <div className="relative group aspect-square overflow-hidden bg-ink/5">
                  <img src={photo.url} alt={photo.caption ?? ''} className="w-full h-full object-cover" />
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
                {albums.length > 0 && (
                  <select
                    defaultValue={photo.album_id ?? ''}
                    onChange={e => handleAssignAlbum(photo.id, e.target.value)}
                    className="font-body text-xs text-ink/50 bg-transparent border-b border-ink/10 pb-1 focus:outline-none focus:border-ink/30"
                  >
                    <option value="">Sin álbum</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>{album.title}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
