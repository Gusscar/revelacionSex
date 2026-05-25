'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FakeRevealProps {
  team: 'boy' | 'girl'
  onComplete: () => void
}

export function FakeReveal({ team, onComplete }: FakeRevealProps) {
  const [phase, setPhase] = useState<'glitch' | 'reveal' | 'fake'>('glitch')
  const isBoy = team === 'boy'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 800)
    const t2 = setTimeout(() => setPhase('fake'), 2000)
    const t3 = setTimeout(() => onComplete(), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <AnimatePresence mode="wait">
        {phase === 'glitch' && (
          <motion.div
            key="glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [1, 0.5, 1],
                  scaleX: [1, 1.02, 1],
                }}
                transition={{ duration: 0.1, repeat: Infinity, delay: i * 0.05 }}
                className="text-6xl font-black text-white absolute inset-0 flex items-center justify-center"
                style={{ color: i % 2 === 0 ? '#ff0055' : '#0055ff', mixBlendMode: 'screen' }}
              >
                ????
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
            style={{ color: isBoy ? '#3b82f6' : '#ec4899' }}
          >
            <div className="text-8xl font-black" style={{ textShadow: `0 0 80px currentColor` }}>
              {isBoy ? 'NIÑO 💙' : 'NIÑA 💖'}
            </div>
          </motion.div>
        )}

        {phase === 'fake' && (
          <motion.div
            key="fake"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3, repeat: 3 }}
              className="text-7xl font-black text-yellow-400"
            >
              JAJA! 😂
            </motion.div>
            <p className="text-2xl text-white/70 font-bold">Era mentira... o si?</p>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-4xl"
            >
              😈
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
