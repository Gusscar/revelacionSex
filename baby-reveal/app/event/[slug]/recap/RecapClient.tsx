'use client'

import { motion } from 'framer-motion'
import { Event, Participant, Reaction } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Props {
  event: Event
  participants: Participant[]
  reactions: Reaction[]
}

export function RecapClient({ event, participants, reactions }: Props) {
  const isBoy = event.result === 'boy'
  const winningTeam = participants.filter((p) => p.team_vote === event.result)
  const losingTeam = participants.filter((p) => p.team_vote !== event.result && p.team_vote)

  const reactionCounts: Record<string, number> = {}
  reactions.forEach((r) => {
    reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1
  })
  const topEmoji = Object.entries(reactionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  async function handleShare() {
    const text = `${event.title}: Es un ${event.result === 'boy' ? 'NIÑO 💙' : 'NIÑA 💖'}! ${participants.length} personas votaron. Ver el recap:`
    if (navigator.share) {
      await navigator.share({ title: event.title, text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`)
    }
  }

  return (
    <main
      className={`min-h-screen px-4 py-12 ${
        isBoy
          ? 'bg-gradient-to-br from-blue-950 via-cyan-900 to-slate-900'
          : 'bg-gradient-to-br from-pink-950 via-rose-900 to-slate-900'
      }`}
    >
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <Link href={`/event/${event.slug}`} className="text-white/40 hover:text-white text-sm">
          ← Volver al evento
        </Link>

        {/* Result Hero */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-center py-8"
        >
          <div className="text-8xl font-black text-white mb-4" style={{
            textShadow: isBoy ? '0 0 60px #3b82f6' : '0 0 60px #ec4899'
          }}>
            {isBoy ? 'NIÑO 💙' : 'NIÑA 💖'}
          </div>
          <p className="text-white/60 text-xl">{event.title}</p>
          {event.baby_name && (
            <p className="text-white/40 mt-2">Baby {event.baby_name}</p>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Participantes', value: participants.length, emoji: '👥' },
            { label: 'Reacciones', value: reactions.length, emoji: '🎉' },
            { label: 'Acertaron', value: winningTeam.length, emoji: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <GlassCard className="p-4 text-center">
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Top Emojis */}
        {topEmoji.length > 0 && (
          <GlassCard className="p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Emojis mas usados
            </p>
            <div className="flex gap-3 flex-wrap">
              {topEmoji.map(([emoji, count]) => (
                <div key={emoji} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm text-white/60 font-semibold">x{count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Winners */}
        {winningTeam.length > 0 && (
          <GlassCard className={`p-5`} glow={isBoy ? 'blue' : 'pink'}>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Profetas ({winningTeam.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {winningTeam.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5"
                >
                  <span className="text-sm font-medium text-white">{p.nickname}</span>
                  <span>{isBoy ? '💙' : '💖'}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Share */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleShare} size="xl" className="w-full">
            Compartir en TikTok / Instagram 🎬
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg" className="w-full">
              Crear otra Revelacion
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
