'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHeroMedia(data: {
  media_type: 'video' | 'image'
  media_url: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('hero_config')
    .update({
      media_type: data.media_type,
      media_url: data.media_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) return { error: error.message }

  revalidatePath('/')

  return { success: true }
}
