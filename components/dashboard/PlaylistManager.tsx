'use client'

import { useState } from 'react'
import { PlaylistTrack } from '@/types/database'
import { createTrack, deleteTrack, updateTrack } from '@/lib/actions/playlist'

interface Props {
  tracks: PlaylistTrack[]
}

const inputCls = 'bg-white border border-ink/15 px-3 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-accent w-full'

export default function PlaylistManager({ tracks: initial }: Props) {
  const [tracks, setTracks] = useState<PlaylistTrack[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ title: '', artist: 'Ana Hagen', soundcloud_url: '', cover_url: '' })
  const [editForm, setEditForm] = useState({ title: '', artist: '', soundcloud_url: '', cover_url: '' })

  const handleAdd = async () => {
    if (!form.soundcloud_url.trim() || !form.title.trim()) return
    setLoading(true)
    setError('')
    const result = await createTrack(form)
    if (result.error) {
      setError(result.error)
    } else {
      setForm({ title: '', artist: 'Ana Hagen', soundcloud_url: '', cover_url: '' })
      setAdding(false)
      window.location.reload()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este track?')) return
    await deleteTrack(id)
    setTracks(t => t.filter(x => x.id !== id))
  }

  const startEdit = (track: PlaylistTrack) => {
    setEditingId(track.id)
    setEditForm({
      title: track.title,
      artist: track.artist,
      soundcloud_url: track.soundcloud_url,
      cover_url: track.cover_url ?? '',
    })
  }

  const handleSaveEdit = async (track: PlaylistTrack) => {
    await updateTrack(track.id, { ...editForm, published: track.published })
    setEditingId(null)
    window.location.reload()
  }

  const togglePublish = async (track: PlaylistTrack) => {
    await updateTrack(track.id, {
      title: track.title,
      artist: track.artist,
      soundcloud_url: track.soundcloud_url,
      cover_url: track.cover_url ?? '',
      published: !track.published,
    })
    setTracks(t => t.map(x => x.id === track.id ? { ...x, published: !x.published } : x))
  }

  return (
    <div className="max-w-2xl">

      {/* Lista */}
      <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 mb-6">
        {tracks.length === 0 && (
          <p className="font-body text-sm text-ink/40 px-4 py-6">No hay tracks cargados.</p>
        )}
        {tracks.map((track, idx) => (
          <div key={track.id} className="px-4 py-4">
            {editingId === track.id ? (
              <div className="flex flex-col gap-2">
                <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Título *" className={inputCls} />
                <input type="text" value={editForm.artist} onChange={e => setEditForm(f => ({ ...f, artist: e.target.value }))} placeholder="Artista" className={inputCls} />
                <input type="url" value={editForm.soundcloud_url} onChange={e => setEditForm(f => ({ ...f, soundcloud_url: e.target.value }))} placeholder="URL de SoundCloud *" className={inputCls} />
                <input type="url" value={editForm.cover_url} onChange={e => setEditForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="URL de cover art (opcional)" className={inputCls} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => handleSaveEdit(track)} className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-accent hover:underline">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="font-body text-xs text-ink/30 hover:text-ink/60">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-display text-xl text-ink/20 w-7 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                {track.cover_url ? (
                  <img src={track.cover_url} alt="" className="w-10 h-10 object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-ink/5 border border-ink/5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-ink font-medium truncate">{track.title}</p>
                  <p className="font-body text-xs text-ink/30 truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => togglePublish(track)} className={`font-body text-xs tracking-[0.1em] uppercase transition-colors ${track.published ? 'text-ink/40 hover:text-ink' : 'text-ink/20 hover:text-ink/50'}`}>
                    {track.published ? 'Visible' : 'Oculto'}
                  </button>
                  <button onClick={() => startEdit(track)} className="font-body text-xs text-ink/40 hover:text-ink transition-colors">Editar</button>
                  <button onClick={() => handleDelete(track.id)} className="font-body text-xs text-ink/30 hover:text-accent transition-colors">Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agregar track */}
      {adding ? (
        <div className="border border-ink/10 p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del track *" className={inputCls} autoFocus />
            <input type="text" value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} placeholder="Artista" className={inputCls} />
          </div>
          <input type="url" value={form.soundcloud_url} onChange={e => setForm(f => ({ ...f, soundcloud_url: e.target.value }))} placeholder="https://soundcloud.com/artista/nombre-del-track *" className={inputCls} />
          <input type="url" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="URL del cover art (Cloudinary, etc.) — opcional" className={inputCls} />
          {error && <p className="font-body text-xs text-accent">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={loading || !form.soundcloud_url.trim() || !form.title.trim()} className="bg-accent text-cream font-body font-semibold text-xs tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => { setAdding(false); setForm({ title: '', artist: 'Ana Hagen', soundcloud_url: '', cover_url: '' }); setError('') }} className="font-body text-xs text-ink/30 hover:text-ink/60 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-accent-dark transition-colors">
          + Agregar track
        </button>
      )}
    </div>
  )
}
