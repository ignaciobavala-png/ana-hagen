import { createClient } from '@/lib/supabase/server'
import EventForm from '@/components/dashboard/EventForm'
import { notFound } from 'next/navigation'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select()
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-8">Editar fecha</h1>
      <EventForm event={event} />
    </div>
  )
}
