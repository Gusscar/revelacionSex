'use client'

import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 80

export function PullToRefresh() {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0) {
        setPullY(Math.min(delta * 0.5, THRESHOLD))
      }
    }

    function onTouchEnd() {
      if (!pulling.current) return
      pulling.current = false
      if (pullY >= THRESHOLD) {
        setRefreshing(true)
        setTimeout(() => window.location.reload(), 300)
      } else {
        setPullY(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullY])

  if (pullY === 0 && !refreshing) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center transition-all"
      style={{ height: refreshing ? 56 : pullY, overflow: 'hidden' }}
    >
      <div className="flex items-center gap-2 text-white/60 text-sm font-semibold">
        {refreshing ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            <span style={{ transform: `rotate(${(pullY / THRESHOLD) * 180}deg)`, display: 'inline-block' }}>↓</span>
            {pullY >= THRESHOLD ? 'Suelta para actualizar' : 'Desliza para actualizar'}
          </>
        )}
      </div>
    </div>
  )
}
