import { createClient } from '@/lib/supabase/server'
import ContactForm from '@/components/dashboard/ContactForm'

const DEFAULTS = {
  booking_email: 'bookinganahagen@gmail.com',
  phone: null,
  instagram: 'https://www.instagram.com/anahagen__/',
  soundcloud: null,
  resident_advisor: null,
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_config')
    .select()
    .eq('id', 1)
    .single()

  const config = data ?? DEFAULTS

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Contacto</h1>
      <p className="font-body text-sm text-ink/40 mb-8">
        Datos de contacto que aparecen en el sitio público.
      </p>
      <ContactForm config={config} />
    </div>
  )
}
