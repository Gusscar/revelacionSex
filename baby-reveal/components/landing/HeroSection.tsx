'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DemoModal } from './DemoModal'

export function HeroSection() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, #3b82f6, transparent)'
                : 'radial-gradient(circle, #ec4899, transparent)',
            }}
            animate={{
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/80 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Crea tu revelacion en segundos
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
        >
          La revelacion de genero{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            mas viral
          </span>{' '}
          del mundo 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/60 mb-10 max-w-xl mx-auto"
        >
          Invita a familia y amigos, voten en tiempo real, reacciones en vivo y una animacion cinematica que nadie olvidara.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/create">
            <Button size="xl" variant="primary" className="text-lg">
              Crear mi Revelacion 🎊
            </Button>
          </Link>
          <Button size="xl" variant="secondary" onClick={() => setShowDemo(true)}>
            Ver Demo 🎬
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-3">
            {['💙', '💖', '🎊', '🎉', '👶'].map((emoji, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-lg"
              >
                {emoji}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm">
            +10,000 familias ya celebraron con nosotros
          </p>
        </motion.div>
      </div>

      {/* Mock reactions floating */}
      {['😱', '🎉', '💙', '💖', '😭'].map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl pointer-events-none"
          style={{ left: `${10 + i * 18}%`, bottom: '20%' }}
          animate={{
            y: [0, -80, -160],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeOut',
          }}
        >
          {emoji}
        </motion.span>
      ))}

      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </section>
  )
}
