'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAlbum(title: string) {
  const supabase = createServiceClient()

  const { data: last } = await supabase
    .from('albums')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase.from('albums').insert({
    title: title.trim(),
    order_index: (last?.order_index ?? -1) + 1,
  })

  if (error) return { error: 'Error al crear el álbum' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}

export async function deleteAlbum(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('albums').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar el álbum' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}

export async function renameAlbum(id: string, title: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('albums')
    .update({ title: title.trim() })
    .eq('id', id)
  if (error) return { error: 'Error al renombrar el álbum' }
  revalidatePath('/')
  revalidatePath('/dashboard/photos')
  return { success: true }
}
