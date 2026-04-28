import { createServiceClient } from '@/lib/supabase/server'
import PhotoManager from '@/components/dashboard/PhotoManager'

export default async function PhotosPage() {
  const supabase = createServiceClient()
  const [{ data: photos }, { data: albums }] = await Promise.all([
    supabase.from('photos').select().order('order_index', { ascending: true }),
    supabase.from('albums').select().order('order_index', { ascending: true }),
  ])

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Fotografía</h1>
      <p className="font-body text-sm text-ink/40 mb-10">
        Organizá las fotos en álbumes. Las fotos sin álbum asignado no aparecen en el sitio.
      </p>

      <PhotoManager photos={photos ?? []} albums={albums ?? []} />
    </div>
  )
}
