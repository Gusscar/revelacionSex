'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/store/eventStore'

export function ParticipantsList() {
  const participants = useEventStore((s) => s.participants)

  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-hide">
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
        Participantes ({participants.length})
      </p>
      <AnimatePresence>
        {participants.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {p.nickname[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-white/80 font-medium">{p.nickname}</span>
            </div>
            {p.team_vote && (
              <span className="text-base">
                {p.team_vote === 'boy' ? '💙' : '💖'}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {participants.length === 0 && (
        <p className="text-white/30 text-sm text-center py-4">Aun no hay participantes</p>
      )}
    </div>
  )
}
