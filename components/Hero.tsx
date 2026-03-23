import { createClient } from '@/lib/supabase/server'
import HeroCTA from './HeroCTA'
import HeroMedia from './HeroMedia'

export default async function Hero() {
  let mediaUrl = '/video/herov.mp4'
  let mediaType: 'video' | 'image' = 'video'

  try {
    const supabase = await createClient()
    const { data: heroConfig } = await supabase
      .from('hero_config')
      .select()
      .eq('id', 1)
      .single()

    if (heroConfig?.media_url) {
      mediaUrl = heroConfig.media_url
      mediaType = heroConfig.media_type
    }
  } catch {
    // Fallback al video local
  }

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
      {/* Fondo con parallax */}
      <HeroMedia url={mediaUrl} type={mediaType} />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 60%, rgba(26,26,26,0.7) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-20 text-center max-w-5xl w-full">
        {/* Línea decorativa superior */}
        <div
          className="hero-enter flex items-center justify-center gap-4 mb-5"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="h-px w-16 bg-cream/40" />
          <span className="font-body text-xs tracking-[0.4em] uppercase text-cream/60">
            DJ · Artist
          </span>
          <div className="h-px w-16 bg-cream/40" />
        </div>

        {/* Título */}
        <h1
          className="hero-enter font-display text-[clamp(5.5rem,18vw,8.5rem)] leading-none tracking-tight select-none"
          style={{
            color: 'transparent',
            WebkitTextStroke: 'clamp(2px, 0.35vw, 3px) #FAF7F2',
            textShadow: '0 0 40px rgba(250,247,242,0.15)',
            animationDelay: '0.5s',
          }}
        >
          ANA
          <br />
          <span className="relative inline-block">
            HAGEN
            <span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-accent -z-10"
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="hero-enter font-body text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase text-cream font-medium mt-5"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)', animationDelay: '0.85s' }}
        >
          <span className="sm:hidden">DJ · Buenos Aires</span>
          <span className="hidden sm:inline">DJ · Buenos Aires · Minimal Techno · House · Techno</span>
        </p>

        {/* CTA */}
        <div className="hero-enter mt-8" style={{ animationDelay: '1.1s' }}>
          <HeroCTA />
        </div>
      </div>

      {/* Indicador de scroll */}
      <div
        className="hero-enter absolute bottom-16 md:bottom-10 right-6 md:right-12 flex flex-col items-center gap-2 z-20"
        style={{ animationDelay: '1.5s' }}
      >
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/40 rotate-90 origin-center mb-4">
          scroll
        </span>
        <div className="w-px h-12 bg-cream/30 animate-pulse" />
      </div>
    </section>
  )
}
