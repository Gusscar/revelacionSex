'use client'

import { motion } from 'framer-motion'
import { QUICK_EMOJIS } from '@/types'
import { sendReaction } from '@/services/events'
import { useEventStore } from '@/store/eventStore'

interface EmojiReactionsProps {
  eventId: string
  userId?: string | null
}

export function EmojiReactions({ eventId, userId }: EmojiReactionsProps) {
  const addFloatingEmoji = useEventStore((s) => s.addFloatingEmoji)

  async function handleEmoji(emoji: string) {
    addFloatingEmoji(emoji)
    try {
      await sendReaction({ event_id: eventId, user_id: userId, type: emoji })
    } catch {
      // optimistic
    }
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {QUICK_EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => handleEmoji(emoji)}
          className="text-2xl p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  )
}
