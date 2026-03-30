import { createServiceClient } from '@/lib/supabase/server'
import LiveControls from '@/components/dashboard/LiveControls'

export default async function LivePage() {
  const supabase = createServiceClient()
  const { data: config } = await supabase
    .from('live_config')
    .select()
    .eq('id', 1)
    .single()

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Transmisión en vivo</h1>
      <p className="font-body text-sm text-ink/40 mb-10">
        Pegá el link de tu stream de YouTube Live y activalo. Aparece automáticamente en el sitio.
      </p>

      <LiveControls initial={config} />

      <div className="mt-12 border border-ink/10 p-6 max-w-xl">
        <h2 className="font-display text-xl tracking-wide text-ink mb-4">Cómo funciona</h2>
        <ol className="flex flex-col gap-3">
          {[
            'Abrí YouTube en el celular o PC e iniciá un stream en vivo.',
            'Copiá el link del stream (ej: youtube.com/live/abc123).',
            'Pegalo acá arriba, agregá un título si querés, y hacé clic en "Activar stream".',
            'La sección EN VIVO aparece automáticamente en el sitio con el video embebido.',
            'Cuando termines, hacé clic en "Terminar transmisión".',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-display text-accent text-xl leading-none mt-0.5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-body text-sm text-ink/60">{step}</span>
            </li>
          ))}
        </ol>
        <p className="font-body text-xs text-ink/35 mt-6 border-t border-ink/10 pt-4">
          Apps recomendadas para transmitir desde el celular: Prism Live Studio · StreamYard · YouTube Studio
        </p>
      </div>
    </div>
  )
}
