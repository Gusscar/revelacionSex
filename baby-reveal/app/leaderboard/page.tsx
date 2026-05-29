'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'

const badges = [
  { emoji: '🏆', label: 'Profeta', desc: 'Adivino el genero' },
  { emoji: '😱', label: 'La tia dramatica', desc: 'Mas reacciones enviadas' },
  { emoji: '💪', label: 'Equivocado pero seguro', desc: 'Voto diferente con 100% confianza' },
  { emoji: '🎯', label: 'Siempre acertado', desc: '3 reveals consecutivos correctos' },
]

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← Volver
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-white mb-2">Leaderboard 🏆</h1>
          <p className="text-white/50 mb-8">Los mejores adivinos del evento</p>

          <GlassCard className="p-6 mb-6">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Badges especiales
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 rounded-2xl p-4 text-center"
                >
                  <div className="text-4xl mb-2">{b.emoji}</div>
                  <p className="text-white font-bold text-sm">{b.label}</p>
                  <p className="text-white/40 text-xs mt-1">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-center text-white/30 py-4">
              El leaderboard se llenara cuando termines tu primer reveal!
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  )
}
