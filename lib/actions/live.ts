'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function goLive(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service
    .from('live_config')
    .update({ is_live: true, stream_title: title || null, started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return { error: 'Error al activar stream' }
  return { success: true }
}

export async function endLive() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service
    .from('live_config')
    .update({ is_live: false, stream_title: null, started_at: null, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return { error: 'Error al terminar stream' }
  return { success: true }
}
