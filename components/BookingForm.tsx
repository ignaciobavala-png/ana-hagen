'use client'

import { useState } from 'react'
import { submitBookingRequest } from '@/lib/actions/booking'

const EVENT_TYPES = ['Evento privado', 'Club / Boliche', 'Festival', 'Otro']

export default function BookingForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await submitBookingRequest({
      name,
      email,
      event_type: eventType,
      event_date: eventDate,
      message,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const inputCls =
    'bg-ink/[0.04] border border-ink/15 px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40 w-full'

  return (
    <div className="mt-10 border-t border-ink/15 pt-8">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 group"
      >
        <span className="font-body text-sm font-semibold tracking-[0.2em] uppercase text-ink group-hover:text-ink/50 transition-colors">
          Solicitar fecha
        </span>
        <span
          className={`text-ink group-hover:text-ink/50 text-lg leading-none transition-all duration-300 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>

      {/* Acordeón */}
      <div className={`grid transition-all duration-500 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {open && (
            <div className="mt-6">
              {success ? (
                <div className="border border-ink/15 px-6 py-5">
                  <p className="font-display text-2xl text-ink tracking-wide">¡Gracias!</p>
                  <p className="font-body text-sm text-ink/50 mt-1">
                    Tu mensaje fue enviado. Ana se contactará pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/40">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/40">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/40">
                        Tipo de evento *
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        required
                        className={inputCls + ' appearance-none'}
                      >
                        <option value="" disabled>Seleccioná...</option>
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/40">
                        Fecha tentativa <span className="text-ink/20">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-body text-xs tracking-[0.15em] uppercase text-ink/40">
                      Mensaje *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="Contanos sobre el evento..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  {error && (
                    <p className="font-body text-xs text-ink/60 bg-ink/5 px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-ink text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-4 hover:bg-ink/70 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Enviando...' : 'Enviar consulta'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="font-body text-xs text-ink/30 hover:text-ink/60 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
