'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function submitBookingRequest(data: {
  name: string
  email: string
  event_type: string
  event_date: string
  message: string
}) {
  if (!data.name || !data.email || !data.event_type || !data.message) {
    return { error: 'Completá todos los campos requeridos.' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('booking_requests').insert({
    name: data.name,
    email: data.email,
    event_type: data.event_type,
    event_date: data.event_date || null,
    message: data.message,
  })

  if (error) return { error: 'Error al enviar. Intentá de nuevo.' }

  return { success: true }
}

export async function markBookingRead(id: string) {
  const supabase = createServiceClient()
  await supabase.from('booking_requests').update({ read: true }).eq('id', id)
}
