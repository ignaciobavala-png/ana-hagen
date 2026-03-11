import { createClient } from '@/lib/supabase/server'
import HeroUploader from '@/components/dashboard/HeroUploader'

export default async function HeroPage() {
  const supabase = await createClient()
  const { data: heroConfig } = await supabase
    .from('hero_config')
    .select()
    .eq('id', 1)
    .single()

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Hero</h1>
      <p className="font-body text-sm text-ink/40 mb-8">
        Video o imagen que aparece de fondo en la sección principal del sitio.
      </p>

      {heroConfig && (
        <div className="bg-white border border-ink/10 p-6 mb-6">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-ink/40 mb-2">Actual</p>
          <p className="font-body text-sm text-ink/60">
            Tipo: <span className="font-semibold text-ink">{heroConfig.media_type}</span>
          </p>
          {heroConfig.media_url ? (
            <p className="font-body text-xs text-ink/40 mt-1 break-all">
              {heroConfig.media_url}
            </p>
          ) : (
            <p className="font-body text-xs text-ink/30 mt-1">
              Sin URL configurada — usando video local /public/video/herov.mp4
            </p>
          )}
          {heroConfig.media_url && heroConfig.media_type === 'image' && (
            <img
              src={heroConfig.media_url}
              alt="Hero actual"
              className="mt-4 max-h-48 object-cover border border-ink/10"
            />
          )}
        </div>
      )}

      <HeroUploader currentConfig={heroConfig} />
    </div>
  )
}
