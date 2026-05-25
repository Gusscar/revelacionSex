'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEventStore } from '@/store/eventStore'
import { Participant, Reaction, Comment, Event } from '@/types'

export function useRealtimeEvent(eventId: string) {
  const {
    addParticipant,
    updateParticipant,
    addReaction,
    addComment,
    addFloatingEmoji,
    setEvent,
    setIsFakeRevealing,
    event,
  } = useEventStore()

  useEffect(() => {
    if (!eventId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'participants', filter: `event_id=eq.${eventId}` },
        (payload) => addParticipant(payload.new as Participant)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'participants', filter: `event_id=eq.${eventId}` },
        (payload) => updateParticipant(payload.new as Participant)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const reaction = payload.new as Reaction
          addReaction(reaction)
          addFloatingEmoji(reaction.type)
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `event_id=eq.${eventId}` },
        (payload) => addComment(payload.new as Comment)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventId}` },
        (payload) => {
          const updated = payload.new as Event
          const prev = payload.old as Partial<Event>

          if ((updated.fake_reveal_count ?? 0) > (prev.fake_reveal_count ?? 0)) {
            const fakeTeam = Math.random() > 0.5 ? 'boy' : 'girl'
            setIsFakeRevealing(true, fakeTeam as 'boy' | 'girl')
          }

          setEvent(updated)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])
}
