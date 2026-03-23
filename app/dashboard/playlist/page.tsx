import { createServiceClient } from '@/lib/supabase/server'
import PlaylistManager from '@/components/dashboard/PlaylistManager'

export default async function PlaylistPage() {
  const supabase = createServiceClient()
  const { data: tracks } = await supabase
    .from('playlist_tracks')
    .select()
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Playlist</h1>
      <p className="font-body text-sm text-ink/40 mb-10">
        Agregá tracks de SoundCloud para la sección <span className="font-semibold text-ink/60">ESCUCHÁ</span> del sitio.
        Pegá la URL del track (soundcloud.com/artista/track-name).
      </p>

      <PlaylistManager tracks={tracks ?? []} />
    </div>
  )
}
