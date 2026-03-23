'use client'

import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { useState } from 'react'

interface BroadcastInnerProps {
  onEnd: () => void
}

function BroadcastInner({ onEnd }: BroadcastInnerProps) {
  const { localParticipant } = useLocalParticipant()
  const [sharing, setSharing] = useState<'screen' | 'camera' | null>(null)

  const shareScreen = async () => {
    await localParticipant.setScreenShareEnabled(true, {
      audio: true,
      video: true,
    })
    setSharing('screen')
  }

  const shareCamera = async () => {
    await localParticipant.setCameraEnabled(true)
    await localParticipant.setMicrophoneEnabled(true)
    setSharing('camera')
  }

  const stopSharing = async () => {
    await localParticipant.setScreenShareEnabled(false)
    await localParticipant.setCameraEnabled(false)
    await localParticipant.setMicrophoneEnabled(false)
    setSharing(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 bg-ink text-cream px-5 py-4">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
        </span>
        <span className="font-display text-xl tracking-[0.15em]">TRANSMITIENDO</span>
      </div>

      {!sharing ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={shareScreen}
            className="bg-accent text-cream font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-accent-dark transition-colors"
          >
            Compartir pantalla
          </button>
          <button
            onClick={shareCamera}
            className="bg-white border border-ink/20 text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-6 py-3 hover:border-ink/40 transition-colors"
          >
            Usar cámara
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-ink/50">
            {sharing === 'screen' ? 'Compartiendo pantalla' : 'Usando cámara'} · En vivo para los visitantes
          </span>
          <button
            onClick={stopSharing}
            className="font-body text-xs text-ink/40 hover:text-ink transition-colors underline"
          >
            Cambiar fuente
          </button>
        </div>
      )}

      <div className="border-t border-ink/10 pt-6">
        <button
          onClick={onEnd}
          className="bg-white border border-ink/20 text-ink font-body font-semibold text-sm tracking-[0.2em] uppercase px-8 py-3 hover:border-accent hover:text-accent transition-colors"
        >
          Terminar transmisión
        </button>
      </div>

      <RoomAudioRenderer />
    </div>
  )
}

interface Props {
  token: string
  serverUrl: string
  onEnd: () => void
}

export default function LiveKitBroadcast({ token, serverUrl, onEnd }: Props) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={false}
      audio={false}
    >
      <BroadcastInner onEnd={onEnd} />
    </LiveKitRoom>
  )
}
