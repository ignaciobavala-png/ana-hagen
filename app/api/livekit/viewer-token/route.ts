import { AccessToken } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'

const ROOM_NAME = 'ana-hagen-live'

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit no configurado' }, { status: 500 })
  }

  // Identidad única por viewer (anónimo)
  const viewerId = `viewer-${Math.random().toString(36).slice(2, 9)}`

  const token = new AccessToken(apiKey, apiSecret, {
    identity: viewerId,
    ttl: '2h',
  })

  token.addGrant({
    room: ROOM_NAME,
    roomJoin: true,
    canPublish: false,
    canSubscribe: true,
  })

  return NextResponse.json({ token: await token.toJwt(), room: ROOM_NAME })
}
