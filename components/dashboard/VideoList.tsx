'use client'

import { useState } from 'react'
import { Video } from '@/types/database'
import { createVideo, deleteVideo, updateVideo } from '@/lib/actions/videos'

interface Props {
  videos: Video[]
}

function extractYoutubeId(input: string): string {
  // Acepta ID directo o URL completa
  const match = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : input.trim()
}

export default function VideoList({ videos: initial }: Props) {
  const [videos, setVideos] = useState<Video[]>(initial)
  const [adding, setAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const handleAdd = async () => {
    if (!newUrl.trim()) return
    setLoading(true)
    setError('')
    const result = await createVideo({ youtube_id: extractYoutubeId(newUrl), title: newTitle })
    if (result.error) {
      setError(result.error)
    } else {
      setNewUrl('')
      setNewTitle('')
      setAdding(false)
      // Recargar
      window.location.reload()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este video?')) return
    await deleteVideo(id)
    setVideos((v) => v.filter((x) => x.id !== id))
  }

  const startEdit = (video: Video) => {
    setEditingId(video.id)
    setEditUrl(video.youtube_id)
    setEditTitle(video.title ?? '')
  }

  const handleSaveEdit = async (video: Video) => {
    await updateVideo(video.id, {
      youtube_id: extractYoutubeId(editUrl),
      title: editTitle,
      published: video.published,
    })
    setEditingId(null)
    window.location.reload()
  }

  const togglePublish = async (video: Video) => {
    await updateVideo(video.id, {
      youtube_id: video.youtube_id,
      title: video.title ?? '',
      published: !video.published,
    })
    setVideos((v) => v.map((x) => x.id === video.id ? { ...x, published: !x.published } : x))
  }

  const inputCls = 'bg-white border border-ink/15 px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-accent'

  return (
    <div className="max-w-2xl">
      {/* Lista */}
      <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 mb-6">
        {videos.length === 0 && (
          <p className="font-body text-sm text-ink/40 px-4 py-6">No hay videos cargados.</p>
        )}
        {videos.map((video, idx) => (
          <div key={video.id} className="px-4 py-4">
            {editingId === video.id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="YouTube ID o URL"
                  className={inputCls + ' w-full'}
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className={inputCls + ' w-full'}
                />
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleSaveEdit(video)}
                    className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-accent hover:underline"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="font-body text-xs text-ink/30 hover:text-ink/60"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`}
                  alt=""
                  className="w-16 h-12 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-ink truncate">
                    {video.title ?? `SET ${String(idx + 1).padStart(2, '0')}`}
                  </p>
                  <p className="font-mono text-xs text-ink/30">{video.youtube_id}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => togglePublish(video)}
                    className={`font-body text-xs tracking-[0.1em] uppercase ${video.published ? 'text-ink/40 hover:text-ink' : 'text-ink/20 hover:text-ink/50'} transition-colors`}
                  >
                    {video.published ? 'Visible' : 'Oculto'}
                  </button>
                  <button
                    onClick={() => startEdit(video)}
                    className="font-body text-xs text-ink/40 hover:text-ink transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="font-body text-xs text-ink/30 hover:text-accent transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agregar video */}
      {adding ? (
        <div className="border border-ink/10 p-4 flex flex-col gap-3">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="YouTube ID o URL completa"
            className={inputCls + ' w-full'}
            autoFocus
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del set (opcional)"
            className={inputCls + ' w-full'}
          />
          {error && <p className="font-body text-xs text-accent">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAdd}
              disabled={loading || !newUrl.trim()}
              className="bg-accent text-cream font-body font-semibold text-xs tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewUrl(''); setNewTitle(''); setError('') }}
              className="font-body text-xs text-ink/30 hover:text-ink/60 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-accent-dark transition-colors"
        >
          + Agregar video
        </button>
      )}
    </div>
  )
}
