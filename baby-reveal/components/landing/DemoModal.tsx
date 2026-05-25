'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type DemoPhase = 'lobby' | 'voting' | 'fake' | 'reveal' | 'recap'

const MOCK_PARTICIPANTS = [
  { name: 'Mama', vote: 'girl', emoji: '💖' },
  { name: 'Papa', vote: 'boy', emoji: '💙' },
  { name: 'Abuela Rosa', vote: 'girl', emoji: '💖' },
  { name: 'Tio Carlos', vote: 'boy', emoji: '💙' },
  { name: 'La tia dramatica', vote: 'girl', emoji: '💖' },
  { name: 'Primo Juan', vote: 'boy', emoji: '💙' },
]

const FLOATING = ['😱', '🎉', '💙', '💖', '😭', '🔥', '🥹']

interface Props {
  onClose: () => void
}

export function DemoModal({ onClose }: Props) {
  const [phase, setPhase] = useState<DemoPhase>('lobby')
  const [visibleParticipants, setVisibleParticipants] = useState<typeof MOCK_PARTICIPANTS>([])
  const [boyPct, setBoyPct] = useState(50)
  const [floaters, setFloaters] = useState<{ id: number; emoji: string; x: number }[]>([])
  const [glitchText, setGlitchText] = useState('????')
  const [countdown, setCountdown] = useState(3)
  const floatId = useRef(0)

  // Phase auto-advance
  useEffect(() => {
    if (phase !== 'lobby') return
    const timers: ReturnType<typeof setTimeout>[] = []
    setVisibleParticipants([])

    MOCK_PARTICIPANTS.forEach((p, i) => {
      const t = setTimeout(() => {
        setVisibleParticipants((prev) => {
          if (prev.some((x) => x.name === p.name)) return prev
          const next = [...prev, p]
          const boys = next.filter((x) => x.vote === 'boy').length
          setBoyPct(Math.round((boys / next.length) * 100))
          return next
        })
        spawnEmoji()
      }, i * 600)
      timers.push(t)
    })

    const advance = setTimeout(() => setPhase('voting'), 4500)
    timers.push(advance)
    return () => timers.forEach(clearTimeout)
  }, [phase])

  useEffect(() => {
    if (phase === 'voting') {
      setTimeout(() => setPhase('fake'), 3000)
    }
    if (phase === 'fake') {
      setTimeout(() => setPhase('reveal'), 4000)
    }
    if (phase === 'reveal') {
      // spam emojis
      for (let i = 0; i < 12; i++) {
        setTimeout(() => spawnEmoji(), i * 200)
      }
      setTimeout(() => setPhase('recap'), 5000)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'fake') {
      const interval = setInterval(() => {
        setGlitchText(Math.random() > 0.5 ? 'NINA 💖' : 'NINO 💙')
      }, 150)
      setTimeout(() => clearInterval(interval), 2000)
      return () => clearInterval(interval)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'reveal') {
      setCountdown(3)
      const t1 = setTimeout(() => setCountdown(2), 1000)
      const t2 = setTimeout(() => setCountdown(1), 2000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [phase])

  function spawnEmoji() {
    const id = floatId.current++
    const emoji = FLOATING[Math.floor(Math.random() * FLOATING.length)]
    const x = Math.random() * 80 + 10
    setFloaters((prev) => [...prev, { id, emoji, x }])
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 2500)
  }

  const girlPct = 100 - boyPct

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floaters.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: '100vh', scale: 0.5 }}
              animate={{ opacity: 0, y: '10vh', scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-4xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-purple-950 via-slate-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/40 hover:text-white text-2xl leading-none cursor-pointer"
        >
          ×
        </button>

        {/* Demo badge */}
        <div className="absolute top-4 left-4 z-10 bg-purple-500/30 border border-purple-400/40 rounded-full px-3 py-1 text-xs text-purple-300 font-semibold">
          DEMO EN VIVO
        </div>

        <div className="p-6 pt-14 min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* LOBBY */}
            {phase === 'lobby' && (
              <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 flex-1">
                <div className="text-center">
                  <div className="text-4xl mb-2">👶</div>
                  <h3 className="text-xl font-black text-white">Revelacion de Baby Garcia</h3>
                  <p className="text-white/40 text-sm mt-1">Los invitados estan entrando...</p>
                </div>
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {visibleParticipants.map((p, i) => (
                      <motion.div
                        key={`${p.name}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            {p.name[0]}
                          </div>
                          <span className="text-sm text-white/80">{p.name}</span>
                        </div>
                        <span>{p.emoji}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* VOTING */}
            {phase === 'voting' && (
              <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5 flex-1 justify-center">
                <div className="text-center">
                  <p className="text-white/50 text-sm mb-2">6 personas han votado</p>
                  <h3 className="text-2xl font-black text-white">Quien crees que es?</h3>
                </div>
                {/* Bar */}
                <div className="flex rounded-full overflow-hidden h-5 bg-white/10">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full flex items-center justify-center text-xs font-bold text-white"
                    animate={{ width: `${boyPct}%` }}
                    transition={{ duration: 1 }}
                  >
                    {boyPct > 20 && `${boyPct}%`}
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-r from-pink-500 to-rose-400 h-full flex items-center justify-center text-xs font-bold text-white flex-1"
                    animate={{ width: `${girlPct}%` }}
                  >
                    {girlPct > 20 && `${girlPct}%`}
                  </motion.div>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-blue-400">💙 Nino {boyPct}%</span>
                  <span className="text-pink-400">Nina {girlPct}% 💖</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-500/20 border border-blue-500/40 rounded-2xl py-4 text-center text-blue-300 font-bold text-lg">
                    💙 Nino
                  </div>
                  <div className="bg-pink-500/20 border border-pink-500/40 rounded-2xl py-4 text-center text-pink-300 font-bold text-lg">
                    💖 Nina
                  </div>
                </div>
                <p className="text-center text-yellow-400 text-sm font-semibold animate-pulse">
                  El host esta por revelar...
                </p>
              </motion.div>
            )}

            {/* FAKE REVEAL */}
            {phase === 'fake' && (
              <motion.div key="fake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 flex-1 items-center justify-center text-center">
                <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
                  Falsa Revelacion 😈
                </p>
                <motion.div
                  animate={{ skewX: [-5, 5, -5, 0], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                  className="text-6xl font-black"
                  style={{
                    color: Math.random() > 0.5 ? '#3b82f6' : '#ec4899',
                    textShadow: '0 0 40px currentColor',
                  }}
                >
                  {glitchText}
                </motion.div>
                <p className="text-white/30 text-xs mt-2">Error de señal...</p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-5xl"
                >
                  😂
                </motion.div>
                <p className="text-yellow-400 font-bold">Era mentira! Ahora si...</p>
              </motion.div>
            )}

            {/* REAL REVEAL */}
            {phase === 'reveal' && (
              <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 items-center justify-center text-center gap-4">
                {countdown > 0 ? (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-9xl font-black text-white"
                  >
                    {countdown}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="text-center"
                  >
                    <div
                      className="text-7xl font-black text-pink-400"
                      style={{ textShadow: '0 0 60px #ec4899' }}
                    >
                      NINA 💖
                    </div>
                    <p className="text-white/60 text-lg mt-3">Es una hermosa beba!</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* RECAP */}
            {phase === 'recap' && (
              <motion.div key="recap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 flex-1">
                <div className="text-center">
                  <div className="text-5xl mb-2" style={{ textShadow: '0 0 40px #ec4899' }}>NINA 💖</div>
                  <p className="text-white/50 text-sm">Recap del evento</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Votaron', value: '6', emoji: '👥' },
                    { label: 'Acertaron', value: '3', emoji: '🏆' },
                    { label: 'Reacciones', value: '24', emoji: '🎉' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-2xl p-3">
                      <div className="text-xl mb-1">{s.emoji}</div>
                      <div className="text-xl font-black text-white">{s.value}</div>
                      <div className="text-xs text-white/40">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-xs text-white/40 mb-3 font-bold uppercase tracking-widest">Profetas 🏆</p>
                  <div className="flex flex-wrap gap-2">
                    {['Mama', 'Abuela Rosa', 'La tia dramatica'].map((n) => (
                      <span key={n} className="bg-pink-500/20 text-pink-300 text-xs font-semibold px-2 py-1 rounded-full">
                        {n} 💖
                      </span>
                    ))}
                  </div>
                </div>
                <Link href="/create" onClick={onClose}>
                  <Button size="lg" className="w-full">
                    Crear mi Revelacion 🎊
                  </Button>
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {(['lobby', 'voting', 'fake', 'reveal', 'recap'] as DemoPhase[]).map((p) => (
            <div
              key={p}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                phase === p ? 'bg-purple-400 w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
