'use client'

import dynamic from 'next/dynamic'
import { PlaylistTrack } from '@/types/database'

const MusicPlayer = dynamic(() => import('./MusicPlayer'), { ssr: false })

export default function PlaylistClient({ tracks }: { tracks: PlaylistTrack[] }) {
  return <MusicPlayer tracks={tracks} />
}
