'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Props {
  team: 'boy' | 'girl'
  onDone: () => void
}

export function VoteCelebration({ team, onDone }: Props) {
  const isBoy = team === 'boy'
  const color = isBoy ? '#3b82f6' : '#ec4899'
  const colorLight = isBoy ? '#93c5fd' : '#f9a8d4'
  const emoji = isBoy ? '💙' : '💖'
  const label = isBoy ? 'Team Niño' : 'Team Niña'

  useEffect(() => {
    // Side burst
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.7 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: [color, colorLight, '#ffffff'] })
    fire(0.2,  { spread: 60, colors: [color, colorLight] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: [color, '#ffffff', colorLight] })
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: [color] })
    fire(0.1,  { spread: 120, startVelocity: 45, colors: [colorLight, '#ffffff'] })

    // Auto-close after animation
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Glow backdrop */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 3, opacity: 0.15 }}
        transition={{ duration: 1 }}
        className="absolute w-64 h-64 rounded-full"
        style={{ background: color }}
      />

      {/* Main card */}
      <motion.div
        initial={{ scale: 0, rotateY: -90 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.1 }}
        style={{ perspective: 1000 }}
        className="relative text-center px-10 py-8 rounded-3xl border"
        css-border={`border-color: ${color}40`}
      >
        {/* 3D floating emoji */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotateZ: [-5, 5, -5],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-4 block"
          style={{ filter: `drop-shadow(0 0 30px ${color})` }}
        >
          {emoji}
        </motion.div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-1">
            Votaste por
          </p>
          <p
            className="text-5xl font-black"
            style={{ color, textShadow: `0 0 40px ${color}` }}
          >
            {label}
          </p>
        </motion.div>

        {/* Orbiting emojis */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{ top: '50%', left: '50%' }}
            animate={{
              rotate: [deg, deg + 360],
              x: [
                Math.cos((deg * Math.PI) / 180) * 80,
                Math.cos(((deg + 360) * Math.PI) / 180) * 80,
              ],
              y: [
                Math.sin((deg * Math.PI) / 180) * 80,
                Math.sin(((deg + 360) * Math.PI) / 180) * 80,
              ],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2.5, ease: 'linear', delay: i * 0.1 }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-20 text-white/50 text-sm font-medium"
      >
        Tu voto esta guardado ✓
      </motion.p>
    </motion.div>
  )
}
