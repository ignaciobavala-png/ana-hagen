'use client'

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
  useConnectionState,
  isTrackReference,
} from '@livekit/components-react'
import { Track, ConnectionState } from 'livekit-client'
import '@livekit/components-styles'

interface Props {
  token: string
  serverUrl: string
}

function StreamPlayer() {
  const connectionState = useConnectionState()

  // Priorizar pantalla compartida, luego cámara
  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: true }
  )
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: true }
  )

  const activeTrack = [screenTracks[0], cameraTracks[0]].find(isTrackReference)

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-6 bg-accent/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="font-body text-xs tracking-[0.25em] uppercase text-cream/55">
          Conectando...
        </p>
      </div>
    )
  }

  if (!activeTrack) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <span className="absolute inline-flex h-3 w-3 rounded-full bg-accent opacity-75 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="font-body text-xs tracking-[0.25em] uppercase text-cream/55">
          Esperando video...
        </p>
        <p className="font-body text-[10px] text-cream/50">
          El audio puede estar activo
        </p>
      </div>
    )
  }

  return (
    <VideoTrack
      trackRef={activeTrack}
      className="absolute inset-0 w-full h-full object-contain bg-black"
    />
  )
}

export default function LiveKitViewer({ token, serverUrl }: Props) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={false}
      audio={false}
      style={{ height: '100%', position: 'relative' }}
    >
      <StreamPlayer />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
