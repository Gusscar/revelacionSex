'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/store/eventStore'

export function FloatingEmojis() {
  const floatingEmojis = useEventStore((s) => s.floatingEmojis)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {floatingEmojis.map((e) => (
          <motion.span
            key={e.id}
            initial={{ opacity: 1, y: '100vh', x: `${e.x}vw`, scale: 0.5 }}
            animate={{ opacity: 0, y: '0vh', scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute text-4xl select-none"
            style={{ left: `${e.x}%`, bottom: 0 }}
          >
            {e.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
