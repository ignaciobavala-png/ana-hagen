import { createClient } from '@/lib/supabase/server'

const FALLBACKS = {
  instagram: 'https://www.instagram.com/anahagen__/',
  soundcloud: null as string | null,
  resident_advisor: null as string | null,
}

export default async function Footer() {
  let links = FALLBACKS

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('contact_config')
      .select('instagram, soundcloud, resident_advisor')
      .eq('id', 1)
      .single()

    if (data) links = data
  } catch {
    // Fallback a valores hardcodeados
  }

  const socialLinks = [
    links.instagram && { label: 'Instagram', href: links.instagram },
    links.soundcloud && { label: 'SoundCloud', href: links.soundcloud },
    links.resident_advisor && { label: 'RA', href: links.resident_advisor },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <footer className="bg-ink text-cream py-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-cream/30">
          © 2026 Ana Hagen
        </p>

        {socialLinks.length > 0 && (
          <nav aria-label="Social media links">
            <ul className="flex items-center gap-6 md:gap-8">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-cream/40 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <a
          href="https://petralabs.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-cream/40 hover:text-accent transition-colors duration-200"
        >
          Petra Labs
        </a>
      </div>
    </footer>
  )
}
