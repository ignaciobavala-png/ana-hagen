'use client'

import { useEffect, useState } from 'react'

export default function ScrollLine() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (total > 0) setProgress((window.scrollY / total) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed left-5 top-0 h-screen w-[2px] z-50 hidden lg:block overflow-hidden">
      <div className="h-full bg-cream/[0.08]" />
      <div
        className="absolute top-0 left-0 w-full bg-accent transition-none"
        style={{ height: `${progress}%` }}
      />
    </div>
  )
}
