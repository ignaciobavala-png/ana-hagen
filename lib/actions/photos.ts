'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPhotos() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('photos')
    .select()
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addPhoto(url: string, caption?: string) {
  const supabase = createServiceClient()

  const { data: last } = await supabase
    .from('photos')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase.from('photos').insert({
    url,
    caption: caption?.trim() || null,
    order_index: (last?.order_index ?? -1) + 1,
  })

  if (error) return { error: 'Error al guardar la foto' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}

export async function updatePhotoCaption(id: string, caption: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('photos')
    .update({ caption: caption.trim() || null })
    .eq('id', id)
  if (error) return { error: 'Error al actualizar caption' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}

export async function deletePhoto(id: string, url: string) {
  const supabase = createServiceClient()

  const filePath = url.split('/storage/v1/object/public/photos/')[1]
  if (filePath) {
    await supabase.storage.from('photos').remove([filePath])
  }

  const { error } = await supabase.from('photos').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar la foto' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}
