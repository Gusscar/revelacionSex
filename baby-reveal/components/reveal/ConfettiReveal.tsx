'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Team } from '@/types'

interface ConfettiRevealProps {
  team: Team
}

export function ConfettiReveal({ team }: ConfettiRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isBoy = team === 'boy'
  const color = isBoy ? '#3b82f6' : '#ec4899'
  const secondColor = isBoy ? '#06b6d4' : '#f43f5e'
  const label = isBoy ? 'NINO 💙' : 'NINA 💖'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces: {
      x: number; y: number; vx: number; vy: number
      size: number; color: string; rotation: number; rotationSpeed: number
    }[] = []

    for (let i = 0; i < 200; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 5 + 2,
        size: Math.random() * 12 + 5,
        color: Math.random() > 0.5 ? color : secondColor,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      })
    }

    let animId: number
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      pieces.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.vy += 0.05

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rotation)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx!.restore()
      })
      if (pieces.some((p) => p.y < canvas!.height + 50)) {
        animId = requestAnimationFrame(animate)
      }
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [color, secondColor])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          className="text-8xl md:text-9xl font-black text-white drop-shadow-2xl"
          style={{ textShadow: `0 0 60px ${color}` }}
        >
          {label}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-2xl text-white/80 font-semibold"
        >
          {isBoy ? 'Es un hermoso bebe!' : 'Es una hermosa beba!'}
        </motion.p>
      </motion.div>
    </div>
  )
}
