'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—!?'

export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const ref = useRef<HTMLSpanElement>(null)

  const scramble = useCallback(() => {
    let iteration = 0
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      iteration += 0.35
      if (iteration >= text.length) {
        clearInterval(intervalRef.current)
        setDisplay(text)
      }
    }, 22)
  }, [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scramble()
          observer.unobserve(el)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearInterval(intervalRef.current)
    }
  }, [scramble])

  return (
    <span ref={ref} className={className} onMouseEnter={scramble}>
      {display}
    </span>
  )
}
