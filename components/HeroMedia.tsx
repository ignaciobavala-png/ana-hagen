'use client'

import { useEffect, useRef } from 'react'

export default function HeroMedia({ url, type }: { url: string; type: 'video' | 'image' }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.35}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 will-change-transform">
      {type === 'video' ? (
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src={url} type="video/mp4" />
        </video>
      ) : (
        <img src={url} alt="Hero background" className="w-full h-full object-cover" />
      )}
    </div>
  )
}
