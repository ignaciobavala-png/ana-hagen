import { createClient } from '@/lib/supabase/server'
import { LiveConfig } from '@/types/database'
import LiveViewer from './LiveViewer'

const FALLBACK: LiveConfig = {
  id: 1,
  is_live: false,
  stream_title: null,
  started_at: null,
  updated_at: new Date().toISOString(),
}

export default async function LiveSection() {
  let config: LiveConfig = FALLBACK

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('live_config')
      .select()
      .eq('id', 1)
      .single()

    if (data) config = data
  } catch {
    // Fallback silencioso
  }

  // LiveViewer maneja la suscripción Realtime y se muestra solo si is_live=true
  return <LiveViewer initial={config} />
}
