'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(data: {
  date: string
  venue: string
  city: string
  ticket_link: string
  flyer_url: string
  published: boolean
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('events').insert({
    date: data.date,
    venue: data.venue,
    city: data.city,
    ticket_link: data.ticket_link || null,
    flyer_url: data.flyer_url || null,
    published: data.published,
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/events')
  redirect('/dashboard/events')
}

export async function updateEvent(
  id: string,
  data: {
    date: string
    venue: string
    city: string
    ticket_link: string
    flyer_url: string
    published: boolean
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({
      date: data.date,
      venue: data.venue,
      city: data.city,
      ticket_link: data.ticket_link || null,
      flyer_url: data.flyer_url || null,
      published: data.published,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/events')
  redirect('/dashboard/events')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/events')
}

export async function toggleEventPublished(id: string, published: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({ published })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/events')
}
