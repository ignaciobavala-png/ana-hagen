import { AccessToken } from 'livekit-server-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ROOM_NAME = 'ana-hagen-live'

export async function POST() {
  // Solo usuarios autenticados pueden obtener un token de host
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit no configurado' }, { status: 500 })
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: 'ana-hagen-host',
    ttl: '4h',
  })

  token.addGrant({
    room: ROOM_NAME,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  return NextResponse.json({ token: await token.toJwt(), room: ROOM_NAME })
}
