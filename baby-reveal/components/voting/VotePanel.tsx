'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/store/eventStore'
import { castVote } from '@/services/events'
import { VoteCelebration } from './VoteCelebration'
import { Team } from '@/types'

interface VotePanelProps {
  eventId: string
}

export function VotePanel({ eventId }: VotePanelProps) {
  const { voteStats, currentUserParticipant, updateParticipant } = useEventStore()
  const [showCelebration, setShowCelebration] = useState(false)
  const [hoveredTeam, setHoveredTeam] = useState<'boy' | 'girl' | null>(null)

  // Check localStorage to prevent double voting
  const storageKey = `voted_${eventId}`
  const storedVote = typeof window !== 'undefined' ? localStorage.getItem(storageKey) as Team : null
  const hasVoted = !!(currentUserParticipant?.team_vote ?? storedVote)
  const votedTeam = currentUserParticipant?.team_vote ?? storedVote

  async function handleVote(team: 'boy' | 'girl') {
    if (hasVoted || !currentUserParticipant) return

    // Optimistic update
    const updated = { ...currentUserParticipant, team_vote: team as Team }
    updateParticipant(updated)

    // Persist locally to block re-voting even after refresh
    localStorage.setItem(storageKey, team)

    // Show celebration
    setShowCelebration(true)

    try {
      await castVote(currentUserParticipant.id, team)
    } catch {
      // Revert on error
      updateParticipant(currentUserParticipant)
      localStorage.removeItem(storageKey)
    }
  }

  const isBoy = votedTeam === 'boy'
  const isGirl = votedTeam === 'girl'

  return (
    <>
      <AnimatePresence>
        {showCelebration && votedTeam && (
          <VoteCelebration
            team={votedTeam as 'boy' | 'girl'}
            onDone={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 w-full">
        {/* Stats bar */}
        <div className="flex rounded-full overflow-hidden h-5 bg-white/10">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full flex items-center justify-end pr-2"
            animate={{ width: `${voteStats.boyPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-gradient-to-r from-pink-500 to-rose-400 h-full flex-1"
            animate={{ width: `${voteStats.girlPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex justify-between text-sm font-bold">
          <span className="text-blue-400">💙 Niño {voteStats.boyPercent}% ({voteStats.boy})</span>
          <span className="text-pink-400">Niña {voteStats.girlPercent}% ({voteStats.girl}) 💖</span>
        </div>

        {!hasVoted ? (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Team Niño button - 3D */}
            <motion.button
              onClick={() => handleVote('boy')}
              onHoverStart={() => setHoveredTeam('boy')}
              onHoverEnd={() => setHoveredTeam(null)}
              whileTap={{ scale: 0.93, rotateX: 8 }}
              animate={{
                rotateY: hoveredTeam === 'boy' ? 8 : 0,
                rotateX: hoveredTeam === 'boy' ? -5 : 0,
                scale: hoveredTeam === 'boy' ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ perspective: 600, transformStyle: 'preserve-3d' }}
              className="relative py-6 rounded-2xl cursor-pointer overflow-hidden group"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-90" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-30"
                transition={{ duration: 0.2 }}
              />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                style={{ transform: 'skewX(-20deg) translateX(-100%)' }}
                animate={hoveredTeam === 'boy' ? { x: ['−100%', '200%'] } : {}}
                transition={{ duration: 0.6 }}
              />

              {/* Shadow glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: '0 8px 30px rgba(59,130,246,0.5)', zIndex: -1 }}
              />

              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.span
                  animate={hoveredTeam === 'boy' ? { scale: [1, 1.3, 1], rotate: [-10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-4xl"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(147,197,253,0.8))' }}
                >
                  💙
                </motion.span>
                <span className="text-white font-black text-lg tracking-wide">Team Niño</span>
              </div>
            </motion.button>

            {/* Team Niña button - 3D */}
            <motion.button
              onClick={() => handleVote('girl')}
              onHoverStart={() => setHoveredTeam('girl')}
              onHoverEnd={() => setHoveredTeam(null)}
              whileTap={{ scale: 0.93, rotateX: 8 }}
              animate={{
                rotateY: hoveredTeam === 'girl' ? -8 : 0,
                rotateX: hoveredTeam === 'girl' ? -5 : 0,
                scale: hoveredTeam === 'girl' ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ perspective: 600, transformStyle: 'preserve-3d' }}
              className="relative py-6 rounded-2xl cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 opacity-90" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-300 opacity-0 group-hover:opacity-30"
                transition={{ duration: 0.2 }}
              />
              <div
                className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: '0 8px 30px rgba(236,72,153,0.5)', zIndex: -1 }}
              />

              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.span
                  animate={hoveredTeam === 'girl' ? { scale: [1, 1.3, 1], rotate: [10, -10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-4xl"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(249,168,212,0.8))' }}
                >
                  💖
                </motion.span>
                <span className="text-white font-black text-lg tracking-wide">Team Niña</span>
              </div>
            </motion.button>
          </div>
        ) : (
          /* Already voted */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className={`relative py-5 rounded-2xl text-center overflow-hidden ${
              isBoy ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-pink-500/20 border border-pink-500/40'
            }`}
          >
            {/* Pulse ring */}
            <motion.div
              className={`absolute inset-0 rounded-2xl border-2 ${isBoy ? 'border-blue-400' : 'border-pink-400'}`}
              animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl mb-2"
            >
              {isBoy ? '💙' : '💖'}
            </motion.div>
            <p className={`font-black text-xl ${isBoy ? 'text-blue-300' : 'text-pink-300'}`}>
              {isBoy ? 'Team Niño' : 'Team Niña'}
            </p>
            <p className="text-white/40 text-xs mt-1">Tu voto esta guardado ✓</p>
          </motion.div>
        )}

        <p className="text-center text-white/30 text-xs">
          {voteStats.total} {voteStats.total === 1 ? 'voto' : 'votos'} totales
        </p>
      </div>
    </>
  )
}
