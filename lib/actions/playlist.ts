'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrack(data: { title: string; artist: string; soundcloud_url: string; cover_url: string }) {
  const supabase = createServiceClient()

  const { data: last } = await supabase
    .from('playlist_tracks')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase.from('playlist_tracks').insert({
    title: data.title.trim(),
    artist: data.artist.trim() || 'Ana Hagen',
    soundcloud_url: data.soundcloud_url.trim(),
    cover_url: data.cover_url.trim() || null,
    sort_order: (last?.sort_order ?? -1) + 1,
    published: true,
  })

  if (error) return { error: 'Error al agregar track' }
  revalidatePath('/')
  revalidatePath('/dashboard/playlist')
  return { success: true }
}

export async function updateTrack(id: string, data: { title: string; artist: string; soundcloud_url: string; cover_url: string; published: boolean }) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('playlist_tracks')
    .update({
      title: data.title.trim(),
      artist: data.artist.trim() || 'Ana Hagen',
      soundcloud_url: data.soundcloud_url.trim(),
      cover_url: data.cover_url.trim() || null,
      published: data.published,
    })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar track' }
  revalidatePath('/')
  revalidatePath('/dashboard/playlist')
  return { success: true }
}

export async function deleteTrack(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('playlist_tracks').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar track' }
  revalidatePath('/')
  revalidatePath('/dashboard/playlist')
  return { success: true }
}
