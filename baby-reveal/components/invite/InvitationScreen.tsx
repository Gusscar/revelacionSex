'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import { Event } from '@/types'

interface InvitationScreenProps {
  event: Event
  onJoin: (nickname: string) => Promise<void>
  joining: boolean
  authDisplayName?: string | null
}

type Phase = 'intro' | 'invitation' | 'join'

export function InvitationScreen({ event, onJoin, joining, authDisplayName }: InvitationScreenProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [nickname, setNickname] = useState(authDisplayName ?? '')
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 400, damping: 40 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 400, damping: 40 })

  // Shimmer highlight that follows the mouse
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['15%', '85%'])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['15%', '85%'])
  const shimmerBg = useTransform(
    [glowX, glowY],
    ([x, y]: string[]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.25) 0%, transparent 65%)`
  )

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.55 + 0.1,
        type: i % 3,
      })),
    []
  )

  useEffect(() => {
    const t = setTimeout(() => setPhase('invitation'), 2800)
    return () => clearTimeout(t)
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  async function handleSubmit() {
    if (!nickname.trim() || joining) return
    await onJoin(nickname.trim())
  }

  const formattedDate = new Date(event.reveal_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#06000f' }}>
      {/* Animated background orbs */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute top-[25%] right-[10%] w-[45vw] h-[45vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: `${p.y + 20}%` }}
            animate={{
              opacity: [0, p.opacity, p.opacity, 0],
              y: [`${p.y + 20}%`, `${p.y - 30}%`],
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
            }}
          >
            {p.type === 0 && (
              <div className="w-full h-full rounded-full bg-white" />
            )}
            {p.type === 1 && (
              <div
                className="w-full h-full bg-purple-300"
                style={{
                  clipPath:
                    'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
                }}
              />
            )}
            {p.type === 2 && (
              <div className="w-full h-full rotate-45 bg-pink-300/80" />
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── PHASE: INTRO ─────────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Pulsing rings */}
            {[0, 0.6, 1.2].map((delay) => (
              <motion.div
                key={delay}
                animate={{ scale: [1, 3.5], opacity: [0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay }}
                className="absolute w-28 h-28 rounded-full border border-purple-400/60"
              />
            ))}

            {/* Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.6, 1], opacity: [0, 0.7, 0.35] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, #c084fc 0%, #a855f7 40%, transparent 70%)' }}
            />

            {/* Baby emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 14 }}
              className="text-[86px] relative z-10 mb-5 select-none"
              style={{ filter: 'drop-shadow(0 0 32px rgba(192,132,252,0.85))' }}
            >
              👶
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="text-center relative z-10 select-none"
            >
              <p className="text-purple-300/60 text-xs font-bold tracking-[0.35em] uppercase mb-2">
                Tienes una
              </p>
              <h1
                className="text-5xl font-black text-white"
                style={{ textShadow: '0 0 60px rgba(192,132,252,0.65)' }}
              >
                Invitacion
              </h1>
            </motion.div>
          </motion.div>
        )}

        {/* ─── PHASE: CARD ──────────────────────────────────── */}
        {(phase === 'invitation' || phase === 'join') && (
          <motion.div
            key="card-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center px-5"
          >
            <div style={{ perspective: '1100px' }} className="w-full max-w-sm">
              <motion.div
                ref={cardRef}
                initial={{ rotateX: 30, y: 70, opacity: 0, scale: 0.88 }}
                animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative select-none"
              >
                {/* Card shadow layer (3D depth illusion) */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    transform: 'translateZ(-30px) scale(0.96)',
                    background: 'rgba(120,40,200,0.45)',
                    filter: 'blur(28px)',
                  }}
                />

                {/* Main card */}
                <div
                  className="relative rounded-3xl overflow-hidden border border-white/20"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(124,58,237,0.3) 0%, rgba(8,3,20,0.92) 55%, rgba(236,72,153,0.22) 100%)',
                    backdropFilter: 'blur(48px)',
                    boxShadow:
                      '0 40px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.18)',
                  }}
                >
                  {/* Mouse-follow shimmer */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: shimmerBg, opacity: 0.9 }}
                  />

                  {/* ── Header banner ── */}
                  <div className="relative h-40 overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #6d28d9 0%, #a855f7 45%, #ec4899 100%)',
                      }}
                    />
                    {/* Shine overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, transparent 55%)',
                      }}
                    />
                    {/* Spinning deco rings */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-10 -right-10 w-36 h-36 rounded-full border-2 border-white/20"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                      className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full border border-white/10"
                    />
                    {/* Center of banner */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                    >
                      <span
                        className="text-5xl"
                        style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))' }}
                      >
                        👶
                      </span>
                      <p className="text-white/70 text-[10px] font-black tracking-[0.3em] uppercase">
                        Gender Reveal
                      </p>
                    </motion.div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="px-7 py-6">
                    <AnimatePresence mode="wait">
                      {/* INVITATION CONTENT */}
                      {phase === 'invitation' && (
                        <motion.div
                          key="invite"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, y: -12 }}
                          className="flex flex-col gap-5"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                          >
                            <p className="text-purple-300/60 text-[10px] tracking-widest uppercase mb-1">
                              Estas invitado/a a
                            </p>
                            <h2 className="text-2xl font-black text-white leading-snug">
                              {event.title}
                            </h2>
                          </motion.div>

                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                          />

                          {event.baby_name && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-center"
                            >
                              <p className="text-white/35 text-xs mb-1">El bebe se llamara</p>
                              <p
                                className="text-3xl font-black text-transparent bg-clip-text"
                                style={{
                                  backgroundImage:
                                    'linear-gradient(135deg, #c084fc, #ec4899)',
                                }}
                              >
                                {event.baby_name}
                              </p>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3 bg-white/6 rounded-2xl px-4 py-3 border border-white/10"
                          >
                            <span className="text-2xl">📅</span>
                            <div>
                              <p className="text-white/35 text-[10px] uppercase tracking-wider">
                                Fecha del reveal
                              </p>
                              <p className="text-white font-bold text-sm capitalize">
                                {formattedDate}
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.68 }}
                          >
                            <motion.button
                              onClick={() => setPhase('join')}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              className="relative w-full py-4 rounded-2xl font-black text-white text-lg cursor-pointer overflow-hidden"
                              style={{
                                background:
                                  'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
                                boxShadow: '0 8px 32px rgba(168,85,247,0.55)',
                              }}
                            >
                              {/* Moving shine */}
                              <motion.div
                                animate={{ x: ['-80%', '160%'] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                                className="absolute inset-y-0 w-1/3 pointer-events-none"
                                style={{
                                  background:
                                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
                                  transform: 'skewX(-15deg)',
                                }}
                              />
                              Entrar a la Fiesta 🎉
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* JOIN CONTENT */}
                      {phase === 'join' && (
                        <motion.div
                          key="join"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="text-center">
                            <p className="text-white/40 text-sm mb-1">Un ultimo paso</p>
                            <h3 className="text-2xl font-black text-white">
                              Como te llamas?
                            </h3>
                          </div>

                          <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Tu nombre..."
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:bg-white/14 transition-all text-center text-base font-semibold"
                          />

                          <motion.button
                            onClick={handleSubmit}
                            disabled={!nickname.trim() || joining}
                            whileHover={{ scale: nickname.trim() && !joining ? 1.03 : 1 }}
                            whileTap={{ scale: nickname.trim() && !joining ? 0.96 : 1 }}
                            className="relative w-full py-3.5 rounded-2xl font-black text-white text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            style={{
                              background:
                                'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
                              boxShadow: '0 8px 32px rgba(168,85,247,0.5)',
                            }}
                          >
                            {joining ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Entrando...
                              </span>
                            ) : (
                              'Entrar como invitado'
                            )}
                          </motion.button>

                          <button
                            onClick={() => setPhase('invitation')}
                            className="text-white/28 text-sm text-center hover:text-white/55 transition-colors cursor-pointer"
                          >
                            Volver
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
