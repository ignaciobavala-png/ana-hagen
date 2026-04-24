import { createServiceClient } from '@/lib/supabase/server'
import PhotoManager from '@/components/dashboard/PhotoManager'

export default async function PhotosPage() {
  const supabase = createServiceClient()
  const { data: photos } = await supabase
    .from('photos')
    .select()
    .order('order_index', { ascending: true })

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Fotografía</h1>
      <p className="font-body text-sm text-ink/40 mb-10">
        Las fotos aparecen en la galería del sitio. Podés subir múltiples fotos a la vez y agregar captions opcionales.
      </p>

      <PhotoManager photos={photos ?? []} />
    </div>
  )
}
