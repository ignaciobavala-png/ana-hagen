'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { Event } from '@/types/database'
import Link from 'next/link'

interface EventFormProps {
  event?: Event
}

export default function EventForm({ event }: EventFormProps) {
  const isEdit = !!event

  const [date, setDate] = useState(event?.date ?? '')
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [city, setCity] = useState(event?.city ?? '')
  const [ticketLink, setTicketLink] = useState(event?.ticket_link ?? '')
  const [published, setPublished] = useState(event?.published ?? true)
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string>(event?.flyer_url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFlyerFile(file)
    setFlyerPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let flyerUrl = event?.flyer_url ?? ''

    if (flyerFile) {
      const supabase = createClient()
      const ext = flyerFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('flyers')
        .upload(fileName, flyerFile, { upsert: true })

      if (uploadError) {
        setError('Error al subir el flyer. Intentá de nuevo.')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('flyers').getPublicUrl(fileName)
      flyerUrl = urlData.publicUrl
    }

    const data = { date, venue, city, ticket_link: ticketLink, flyer_url: flyerUrl, published }

    const result = isEdit
      ? await updateEvent(event.id, data)
      : await createEvent(data)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Si no hay error, el server action hizo redirect a /dashboard/events
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">
      {/* Fecha */}
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Fecha *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {/* Venue */}
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Venue / Lugar *
        </label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          placeholder="ej: Niceto Club"
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {/* Ciudad */}
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Ciudad *
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder="ej: Buenos Aires"
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {/* Link de tickets */}
      <div className="flex flex-col gap-1">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Link de entradas <span className="text-ink/30">(opcional — si no hay, muestra "FREE")</span>
        </label>
        <input
          type="url"
          value={ticketLink}
          onChange={(e) => setTicketLink(e.target.value)}
          placeholder="https://passline.com/..."
          className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {/* Flyer */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
          Flyer <span className="text-ink/30">(opcional — JPG, PNG, WebP)</span>
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFlyerChange}
          className="font-body text-sm text-ink/60 file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-ink file:text-cream file:font-body file:text-xs file:tracking-[0.2em] file:uppercase file:cursor-pointer"
        />
        {flyerPreview && (
          <img
            src={flyerPreview}
            alt="Preview del flyer"
            className="max-h-40 object-cover border border-ink/10"
          />
        )}
      </div>

      {/* Publicado */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 accent-[#C8102E]"
        />
        <span className="font-body text-sm text-ink">
          Publicar en el sitio
          {!published && (
            <span className="text-ink/40 ml-2">(guardado como borrador)</span>
          )}
        </span>
      </label>

      {error && <p className="font-body text-xs text-accent">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear fecha'}
        </button>
        <Link
          href="/dashboard/events"
          className="font-body text-sm text-ink/40 hover:text-ink transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
