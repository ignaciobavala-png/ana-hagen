'use client'

import { useState } from 'react'
import { updateContactConfig } from '@/lib/actions/contact'

interface ContactFormProps {
  config: {
    booking_email: string
    phone: string | null
    instagram: string | null
    soundcloud: string | null
    resident_advisor: string | null
  }
}

export default function ContactForm({ config }: ContactFormProps) {
  const [bookingEmail, setBookingEmail] = useState(config.booking_email)
  const [phone, setPhone] = useState(config.phone ?? '')
  const [instagram, setInstagram] = useState(config.instagram ?? '')
  const [soundcloud, setSoundcloud] = useState(config.soundcloud ?? '')
  const [residentAdvisor, setResidentAdvisor] = useState(config.resident_advisor ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const result = await updateContactConfig({
      booking_email: bookingEmail,
      phone,
      instagram,
      soundcloud,
      resident_advisor: residentAdvisor,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const Field = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required,
    hint,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    type?: string
    placeholder?: string
    required?: boolean
    hint?: string
  }) => (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs tracking-[0.2em] uppercase text-ink/60">
        {label} {!required && <span className="text-ink/30">(opcional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="bg-white border border-ink/15 px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-accent"
      />
      {hint && <p className="font-body text-xs text-ink/30">{hint}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">
      <Field
        label="Email de booking"
        value={bookingEmail}
        onChange={setBookingEmail}
        type="email"
        required
        hint="Se muestra como link de contacto en la sección Booking del sitio."
      />

      <Field
        label="Teléfono / WhatsApp"
        value={phone}
        onChange={setPhone}
        placeholder="+54 9 11 ..."
        hint="Si completás este campo aparece como link de contacto adicional."
      />

      <Field
        label="Instagram (URL completa)"
        value={instagram}
        onChange={setInstagram}
        placeholder="https://www.instagram.com/anahagen__/"
        hint="Se muestra en el footer del sitio."
      />

      <Field
        label="SoundCloud (URL)"
        value={soundcloud}
        onChange={setSoundcloud}
        placeholder="https://soundcloud.com/..."
        hint="Aparece en el footer cuando esté disponible."
      />

      <Field
        label="Resident Advisor (URL)"
        value={residentAdvisor}
        onChange={setResidentAdvisor}
        placeholder="https://ra.co/dj/..."
        hint="Aparece en el footer cuando esté disponible."
      />

      {error && <p className="font-body text-xs text-accent">{error}</p>}
      {success && (
        <p className="font-body text-xs text-green-700">
          Cambios guardados. El sitio se actualizó.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:bg-accent-dark transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
