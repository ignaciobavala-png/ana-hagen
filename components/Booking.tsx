import { createClient } from '@/lib/supabase/server'
import BookingForm from './BookingForm'

const FALLBACK_EMAIL = 'bookinganahagen@gmail.com'

export default async function Booking() {
  let bookingEmail = FALLBACK_EMAIL
  let phone: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('contact_config')
      .select('booking_email, phone')
      .eq('id', 1)
      .single()

    if (data?.booking_email) bookingEmail = data.booking_email
    phone = data?.phone ?? null
  } catch {
    // Fallback a valores hardcodeados
  }

  return (
    <section
      id="booking"
      className="bg-accent py-20 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden"
    >
      {/* Texto decorativo de fondo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[clamp(8rem,25vw,22rem)] leading-none tracking-tight text-ink/[0.07] whitespace-nowrap">
          BOOKING
        </span>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="mb-10 md:mb-14">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-cream">
            BOOKING
          </h2>
          <div className="h-1 w-16 bg-cream mt-4" />
        </div>

        {/* Email link */}
        <a
          href={`mailto:${bookingEmail}`}
          className="group inline-block font-display text-[clamp(1.5rem,4.5vw,3.5rem)] leading-tight tracking-tight text-cream hover:text-ink transition-colors duration-200 relative"
        >
          {bookingEmail}
          <span
            className="absolute bottom-0 left-0 h-[3px] w-0 bg-cream group-hover:w-full transition-all duration-300"
            aria-hidden="true"
          />
        </a>

        {/* Teléfono / WhatsApp (si está configurado) */}
        {phone && (
          <div className="mt-4">
            <a
              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-cream/60 hover:text-cream transition-colors tracking-wide"
            >
              WhatsApp: {phone}
            </a>
          </div>
        )}

        {/* Formulario de consulta */}
        <BookingForm />

        {/* Grid decorativo */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="#FAF7F2" strokeWidth="1" />
                <line x1="0" y1={i * 40} x2="200" y2={i * 40} stroke="#FAF7F2" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
