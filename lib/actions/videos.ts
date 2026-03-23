'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVideo(data: { youtube_id: string; title: string }) {
  const supabase = createServiceClient()

  // Poner al final del sort_order actual
  const { data: last } = await supabase
    .from('videos')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (last?.sort_order ?? -1) + 1

  const { error } = await supabase.from('videos').insert({
    youtube_id: data.youtube_id.trim(),
    title: data.title.trim() || '',
    sort_order: nextOrder,
    published: true,
  })

  if (error) return { error: 'Error al crear video' }
  revalidatePath('/')
  revalidatePath('/dashboard/videos')
  return { success: true }
}

export async function updateVideo(id: string, data: { youtube_id: string; title: string; published: boolean }) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('videos')
    .update({ youtube_id: data.youtube_id.trim(), title: data.title.trim() || '', published: data.published })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar video' }
  revalidatePath('/')
  revalidatePath('/dashboard/videos')
  return { success: true }
}

export async function deleteVideo(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar video' }
  revalidatePath('/')
  revalidatePath('/dashboard/videos')
  return { success: true }
}

export async function reorderVideos(ids: string[]) {
  const supabase = createServiceClient()
  await Promise.all(
    ids.map((id, index) =>
      supabase.from('videos').update({ sort_order: index }).eq('id', id)
    )
  )
  revalidatePath('/')
  revalidatePath('/dashboard/videos')
  return { success: true }
}
