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
        Cuando activés el stream, aparece una sección EN VIVO en el sitio público en tiempo real.
      </p>

      <LiveControls initial={config} />

      {/* Instrucciones */}
      <div className="mt-12 border border-ink/10 p-6 max-w-xl">
        <h2 className="font-display text-xl tracking-wide text-ink mb-4">Cómo funciona</h2>
        <ol className="flex flex-col gap-3">
          {[
            'Escribí un título para la transmisión (opcional).',
            'Hacé clic en "Empezar transmisión".',
            'El navegador te va a pedir permiso de cámara, micrófono o pantalla.',
            'Elegí qué compartir: podés usar pantalla completa con audio del sistema para el set.',
            'Los visitantes van a ver la sección EN VIVO aparecer automáticamente.',
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
      </div>
    </div>
  )
}
