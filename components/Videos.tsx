import { createClient } from '@/lib/supabase/server'
import { Video } from '@/types/database'
import VideosCarousel from './VideosCarousel'

export default async function Videos() {
  let videos: Video[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('videos')
      .select()
      .eq('published', true)
      .order('sort_order', { ascending: true })

    videos = data ?? []
  } catch {
    // Supabase no disponible
  }

  if (videos.length === 0) return null

  return <VideosCarousel videos={videos} />
}
