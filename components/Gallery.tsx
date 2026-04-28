import { createClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'
import { AlbumWithPhotos, Photo } from '@/types/database'

export default async function Gallery() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('albums')
    .select('*, photos(*)')
    .order('order_index', { ascending: true })

  if (!data || data.length === 0) return null

  const albums = data.map(album => ({
    ...album,
    photos: ((album.photos ?? []) as Photo[])
      .sort((a, b) => a.order_index - b.order_index),
  })).filter(album => album.photos.length > 0) as AlbumWithPhotos[]

  if (albums.length === 0) return null

  return <GalleryClient albums={albums} />
}
