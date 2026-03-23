import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types/database'
import DatesSection from './DatesSection'

export default async function Dates() {
  let events: Event[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select()
      .eq('published', true)
      .order('date', { ascending: true })
    events = data ?? []
  } catch {}

  return <DatesSection events={events} />
}
