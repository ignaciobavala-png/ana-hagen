'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

declare global {
  interface Window { SC: any }
}

export interface SCWidgetState {
  isPlaying: boolean
  position: number  // ms
  duration: number  // ms
  ready: boolean
}

export function useSoundCloudWidget(iframeId: string) {
  const widgetRef = useRef<any>(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [state, setState] = useState<SCWidgetState>({
    isPlaying: false,
    position: 0,
    duration: 0,
    ready: false,
  })

  // Cargar el SDK de SoundCloud una sola vez
  useEffect(() => {
    const already = document.querySelector('[data-sc-sdk]')
    if (already) {
      if (window.SC) setSdkLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.setAttribute('data-sc-sdk', '1')
    script.onload = () => setSdkLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Inicializar el widget cuando el SDK está listo
  useEffect(() => {
    if (!sdkLoaded) return
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    if (!iframe || widgetRef.current) return

    const widget = window.SC.Widget(iframe)
    widgetRef.current = widget

    widget.bind(window.SC.Widget.Events.READY, () => {
      widget.getDuration((d: number) => {
        setState(s => ({ ...s, ready: true, duration: d }))
      })
    })

    widget.bind(window.SC.Widget.Events.PLAY, () =>
      setState(s => ({ ...s, isPlaying: true }))
    )
    widget.bind(window.SC.Widget.Events.PAUSE, () =>
      setState(s => ({ ...s, isPlaying: false }))
    )
    widget.bind(window.SC.Widget.Events.FINISH, () =>
      setState(s => ({ ...s, isPlaying: false, position: 0 }))
    )
    widget.bind(
      window.SC.Widget.Events.PLAY_PROGRESS,
      (data: { currentPosition: number }) => {
        setState(s => ({ ...s, position: data.currentPosition }))
      }
    )
  }, [sdkLoaded, iframeId])

  const load = useCallback((url: string, autoPlay = true) => {
    if (!widgetRef.current) return
    setState(s => ({ ...s, ready: false, position: 0, duration: 0 }))
    widgetRef.current.load(url, {
      auto_play: autoPlay,
      buying: false,
      liking: false,
      download: false,
      sharing: false,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
      visual: false,
    })
  }, [])

  const play = useCallback(() => widgetRef.current?.play(), [])
  const pause = useCallback(() => widgetRef.current?.pause(), [])

  const toggle = useCallback(() => {
    if (!widgetRef.current) return
    state.isPlaying ? widgetRef.current.pause() : widgetRef.current.play()
  }, [state.isPlaying])

  const seekTo = useCallback((ms: number) => {
    widgetRef.current?.seekTo(ms)
    setState(s => ({ ...s, position: ms }))
  }, [])

  return { state, load, play, pause, toggle, seekTo, widgetReady: state.ready }
}
