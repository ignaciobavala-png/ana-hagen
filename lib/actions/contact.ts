'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContactConfig(data: {
  booking_email: string
  phone: string
  instagram: string
  soundcloud: string
  resident_advisor: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_config')
    .update({
      booking_email: data.booking_email,
      phone: data.phone || null,
      instagram: data.instagram || null,
      soundcloud: data.soundcloud || null,
      resident_advisor: data.resident_advisor || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}
