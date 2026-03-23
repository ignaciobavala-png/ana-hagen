import { createClient } from '@/lib/supabase/server'
import { PlaylistTrack } from '@/types/database'
import PlaylistClient from './PlaylistClient'

export default async function PlaylistSection() {
  let tracks: PlaylistTrack[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('playlist_tracks')
      .select()
      .eq('published', true)
      .order('sort_order', { ascending: true })

    tracks = data ?? []
  } catch {
    // Supabase no disponible → no mostrar la sección
  }

  return <PlaylistClient tracks={tracks} />
}
