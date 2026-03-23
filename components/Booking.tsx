import { createClient } from '@/lib/supabase/server'
import BookingForm from './BookingForm'
import ScrambleText from './ScrambleText'

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
    phone = data?.phone || null
  } catch {
    // Fallback
  }

  return (
    <section
      id="booking"
      data-reveal
      className="bg-cream border-t border-ink/[0.12] py-20 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden"
    >
      {/* Ghost text de fondo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[clamp(8rem,25vw,22rem)] leading-none tracking-tight text-ink/[0.04] whitespace-nowrap">
          BOOKING
        </span>
      </div>

      {/* Section number */}
      <span
        className="absolute -right-4 top-0 font-display leading-none text-ink/[0.04] select-none pointer-events-none"
        style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}
        aria-hidden="true"
      >04</span>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="mb-10 md:mb-14">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-ink">
            <ScrambleText text="BOOKING" />
          </h2>
          <div className="h-px w-16 bg-ink/30 mt-4" />
        </div>

        {/* Email link */}
        <a
          href={`mailto:${bookingEmail}`}
          className="group inline-block font-display text-[clamp(1.5rem,4.5vw,3.5rem)] leading-tight tracking-tight text-ink hover:text-ink/50 transition-colors duration-300 relative"
        >
          {bookingEmail}
          <span
            className="absolute bottom-0 left-0 h-[2px] w-0 bg-ink group-hover:w-full transition-all duration-300"
            aria-hidden="true"
          />
        </a>

        {/* Teléfono / WhatsApp */}
        {phone && (
          <div className="mt-4">
            <a
              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-ink/40 hover:text-ink transition-colors tracking-wide"
            >
              WhatsApp: {phone}
            </a>
          </div>
        )}

        {/* Formulario */}
        <BookingForm />

        {/* Grid decorativo */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.07] pointer-events-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="#0a0a0a" strokeWidth="1" />
                <line x1="0" y1={i * 40} x2="200" y2={i * 40} stroke="#0a0a0a" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
