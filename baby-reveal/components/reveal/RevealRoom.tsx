'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/store/eventStore'
import { ConfettiReveal } from './ConfettiReveal'
import { FakeReveal } from './FakeReveal'
import { Countdown } from '@/components/ui/Countdown'
import { VotePanel } from '@/components/voting/VotePanel'
import { EmojiReactions } from '@/components/reactions/EmojiReactions'
import { FloatingEmojis } from '@/components/reactions/FloatingEmojis'
import { ParticipantsList } from '@/components/voting/ParticipantsList'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useRealtimeEvent } from '@/hooks/useRealtimeEvent'
import { triggerReveal, triggerFakeReveal } from '@/services/events'
import { useAuthStore } from '@/store/authStore'

interface RevealRoomProps {
  eventId: string
  isOwner: boolean
}

export function RevealRoom({ eventId, isOwner }: RevealRoomProps) {
  const { event, isRevealing, isFakeRevealing, fakeRevealTeam, setIsFakeRevealing } = useEventStore()
  const { user } = useAuthStore()
  const [showCountdownComplete, setShowCountdownComplete] = useState(false)
  const [comments, setComments] = useState<string>('')

  useRealtimeEvent(eventId)

  const isBoy = event?.result === 'boy'
  const bgGradient = event?.is_revealed
    ? isBoy
      ? 'from-blue-950 via-blue-900 to-cyan-900'
      : 'from-pink-950 via-pink-900 to-rose-900'
    : 'from-purple-950 via-slate-900 to-black'

  async function handleReveal(team: 'boy' | 'girl') {
    await triggerReveal(eventId, team)
  }

  async function handleFakeReveal() {
    const fakeTeam = Math.random() > 0.5 ? 'boy' : 'girl'
    setIsFakeRevealing(true, fakeTeam as 'boy' | 'girl')
    await triggerFakeReveal(eventId)
  }

  if (!event) return null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-2000`}>
      <FloatingEmojis />

      <AnimatePresence>
        {isFakeRevealing && fakeRevealTeam && (
          <FakeReveal
            team={fakeRevealTeam}
            onComplete={() => setIsFakeRevealing(false)}
          />
        )}

        {event.is_revealed && event.result && (
          <ConfettiReveal team={event.result} />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-white">{event.title}</h1>
          {event.baby_name && (
            <p className="text-white/50 mt-1">Baby {event.baby_name}</p>
          )}
        </motion.div>

        {/* Countdown */}
        {!event.is_revealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Countdown
              targetDate={event.reveal_date}
              onComplete={() => setShowCountdownComplete(true)}
            />
            {showCountdownComplete && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-yellow-400 font-bold mt-3 text-lg"
              >
                Es hora del reveal!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Vote Panel */}
        {!event.is_revealed && (
          <GlassCard className="p-5" glow="purple">
            <VotePanel eventId={eventId} />
          </GlassCard>
        )}

        {/* Waiting for reveal */}
        {!event.is_revealed && (
          <GlassCard className="p-5">
            <div className="text-center py-2">
              <div className="text-3xl mb-2 animate-pulse">🔐</div>
              <p className="text-white/60 font-semibold text-sm">
                Solo la guardiana del secreto puede revelar
              </p>
              <p className="text-white/30 text-xs mt-1">
                Ella tiene el link secreto para disparar el reveal
              </p>
            </div>
          </GlassCard>
        )}

        {/* Reactions */}
        <GlassCard className="p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
            Reacciones en vivo
          </p>
          <EmojiReactions eventId={eventId} userId={user?.id} />
        </GlassCard>

        {/* Participants */}
        <GlassCard className="p-5">
          <ParticipantsList />
        </GlassCard>
      </div>
    </div>
  )
}
