import { createClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'

export default async function Gallery() {
  const supabase = await createClient()
  const { data: photos } = await supabase
    .from('photos')
    .select()
    .order('order_index', { ascending: true })

  if (!photos || photos.length === 0) return null

  return <GalleryClient photos={photos} />
}
