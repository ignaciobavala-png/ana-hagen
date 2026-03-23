import { createServiceClient } from '@/lib/supabase/server'
import VideoList from '@/components/dashboard/VideoList'

export default async function VideosPage() {
  const supabase = createServiceClient()
  const { data: videos } = await supabase
    .from('videos')
    .select()
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Sets / Videos</h1>
      <p className="font-body text-sm text-ink/40 mb-10">
        Administrá los videos de YouTube que aparecen en la sección SETS del sitio.
      </p>

      <VideoList videos={videos ?? []} />
    </div>
  )
}
