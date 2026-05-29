'use client'

import { create } from 'zustand'
import { Event, Participant, Reaction, Comment, FloatingEmoji, VoteStats, Team } from '@/types'

interface EventStore {
  event: Event | null
  participants: Participant[]
  reactions: Reaction[]
  comments: Comment[]
  floatingEmojis: FloatingEmoji[]
  voteStats: VoteStats
  isRevealing: boolean
  isFakeRevealing: boolean
  fakeRevealTeam: Team
  currentUserParticipant: Participant | null

  setEvent: (event: Event) => void
  setParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  updateParticipant: (participant: Participant) => void
  addReaction: (reaction: Reaction) => void
  setComments: (comments: Comment[]) => void
  addComment: (comment: Comment) => void
  addFloatingEmoji: (emoji: string) => void
  removeFloatingEmoji: (id: string) => void
  setIsRevealing: (v: boolean) => void
  setIsFakeRevealing: (v: boolean, team?: Team) => void
  setCurrentUserParticipant: (p: Participant | null) => void
  computeVoteStats: () => void
}

function calcStats(participants: Participant[]): VoteStats {
  const voters = participants.filter((p) => p.team_vote)
  const boy = voters.filter((p) => p.team_vote === 'boy').length
  const girl = voters.filter((p) => p.team_vote === 'girl').length
  const total = boy + girl
  return {
    boy,
    girl,
    total,
    boyPercent: total > 0 ? Math.round((boy / total) * 100) : 50,
    girlPercent: total > 0 ? Math.round((girl / total) * 100) : 50,
  }
}

export const useEventStore = create<EventStore>((set, get) => ({
  event: null,
  participants: [],
  reactions: [],
  comments: [],
  floatingEmojis: [],
  voteStats: { boy: 0, girl: 0, total: 0, boyPercent: 50, girlPercent: 50 },
  isRevealing: false,
  isFakeRevealing: false,
  fakeRevealTeam: null,
  currentUserParticipant: null,

  setEvent: (event) => set({ event }),

  setParticipants: (participants) =>
    set({ participants, voteStats: calcStats(participants) }),

  addParticipant: (participant) =>
    set((state) => {
      const updated = [...state.participants.filter((p) => p.id !== participant.id), participant]
      return { participants: updated, voteStats: calcStats(updated) }
    }),

  updateParticipant: (participant) =>
    set((state) => {
      const updated = state.participants.map((p) => (p.id === participant.id ? participant : p))
      return { participants: updated, voteStats: calcStats(updated) }
    }),

  addReaction: (reaction) =>
    set((state) => ({ reactions: [reaction, ...state.reactions].slice(0, 100) })),

  setComments: (comments) => set({ comments }),

  addComment: (comment) =>
    set((state) => {
      if (state.comments.some((c) => c.id === comment.id)) return state
      return { comments: [comment, ...state.comments].slice(0, 200) }
    }),

  addFloatingEmoji: (emoji) => {
    const id = Math.random().toString(36).slice(2)
    const floatingEmoji: FloatingEmoji = {
      id,
      emoji,
      x: Math.random() * 80 + 10,
      createdAt: Date.now(),
    }
    set((state) => ({ floatingEmojis: [...state.floatingEmojis, floatingEmoji] }))
    setTimeout(() => get().removeFloatingEmoji(id), 3000)
  },

  removeFloatingEmoji: (id) =>
    set((state) => ({ floatingEmojis: state.floatingEmojis.filter((e) => e.id !== id) })),

  setIsRevealing: (isRevealing) => set({ isRevealing }),

  setIsFakeRevealing: (isFakeRevealing, fakeRevealTeam = null) =>
    set({ isFakeRevealing, fakeRevealTeam }),

  setCurrentUserParticipant: (currentUserParticipant) => set({ currentUserParticipant }),

  computeVoteStats: () =>
    set((state) => ({ voteStats: calcStats(state.participants) })),
}))
