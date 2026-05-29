'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Event, Participant, Comment } from '@/types'
import { useEventStore } from '@/store/eventStore'
import { RevealRoom } from '@/components/reveal/RevealRoom'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { joinEvent, sendComment } from '@/services/events'
import { createClient } from '@/lib/supabase/client'
import { InvitationScreen } from '@/components/invite/InvitationScreen'
import { filterProfanity, containsProfanity } from '@/utils/profanity'
import { loadGuestId } from '@/utils/guestAuth'

interface Props {
  initialEvent: Event
  initialParticipants: Participant[]
  initialComments: Comment[]
  userId: string | null
  isOwner: boolean
}

export function EventLobbyClient({
  initialEvent,
  initialParticipants,
  initialComments,
  userId,
  isOwner,
}: Props) {
  const {
    setEvent,
    setParticipants,
    comments,
    setComments,
    addComment,
    currentUserParticipant,
    setCurrentUserParticipant,
    addParticipant,
  } = useEventStore()

  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [tab, setTab] = useState<'lobby' | 'chat' | 'qr'>('lobby')
  const [inviteUrl, setInviteUrl] = useState('')

  useEffect(() => {
    async function init() {
      setEvent(initialEvent)
      setParticipants(initialParticipants)
      setComments(initialComments)
      setInviteUrl(window.location.href)

      const participantKey = `participant_${initialEvent.id}`

      try {
        // 1. Restaurar desde localStorage (más rápido, sin red)
        const raw = localStorage.getItem(participantKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.id && parsed?.event_id === initialEvent.id) {
            setCurrentUserParticipant(parsed as Participant)
            setJoined(true)
            // Refrescar en background
            createClient()
              .from('participants')
              .select('*')
              .eq('id', parsed.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setCurrentUserParticipant(data)
                  localStorage.setItem(participantKey, JSON.stringify(data))
                } else {
                  localStorage.removeItem(participantKey)
                  setJoined(false)
                }
              })
            return
          }
          localStorage.removeItem(participantKey)
        }

        // 2. Buscar por guest_account_id guardado localmente
        const guestId = loadGuestId()
        if (guestId) {
          const { data: existing } = await createClient()
            .from('participants')
            .select('*')
            .eq('event_id', initialEvent.id)
            .eq('user_id', guestId)
            .maybeSingle()
          if (existing) {
            setCurrentUserParticipant(existing)
            localStorage.setItem(participantKey, JSON.stringify(existing))
            setJoined(true)
          }
        }
      } catch {
        // Si algo falla, mostrar la pantalla de invitacion
      } finally {
        setMounted(true)
      }
    }

    init()
  }, [])

  // Mantener localStorage sincronizado cuando el participante cambia (ej: voto)
  useEffect(() => {
    if (!currentUserParticipant) return
    localStorage.setItem(
      `participant_${initialEvent.id}`,
      JSON.stringify(currentUserParticipant)
    )
  }, [currentUserParticipant])

  async function handleJoin(name: string) {
    if (!name.trim()) return
    setJoining(true)
    try {
      const participant = await joinEvent({
        event_id: initialEvent.id,
        nickname: name.trim(),
        user_id: loadGuestId(),
      })
      setCurrentUserParticipant(participant)
      addParticipant(participant)
      localStorage.setItem(`participant_${initialEvent.id}`, JSON.stringify(participant))
      setJoined(true)
    } catch (e) {
      console.error(e)
    } finally {
      setJoining(false)
    }
  }

  async function handleComment() {
    const text = comment.trim()
    if (!text) return
    if (containsProfanity(text)) {
      setCommentError('Tu mensaje contiene palabras no permitidas.')
      return
    }
    setCommentError(null)
    const filtered = filterProfanity(text)
    const newComment = await sendComment({
      event_id: initialEvent.id,
      user_id: userId,
      nickname: currentUserParticipant?.nickname,
      message: filtered,
    })
    addComment(newComment)
    setComment('')
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(inviteUrl)
  }

  // Esperar a que el useEffect lea localStorage antes de decidir qué mostrar
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    )
  }

  if (!joined && !isOwner) {
    return (
      <InvitationScreen
        event={initialEvent}
        onJoin={handleJoin}
        joining={joining}
      />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black">
      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto flex">
          {(['lobby', 'chat', 'qr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
                tab === t
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'lobby' ? '🎉 Lobby' : t === 'chat' ? '💬 Chat' : '📱 Invitar'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RevealRoom eventId={initialEvent.id} isOwner={isOwner} />
          </motion.div>
        )}

        {tab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4"
          >
            {/* Comment Input */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setCommentError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Escribe algo..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                />
                <Button onClick={handleComment} size="md" className="flex-shrink-0">
                  Enviar
                </Button>
              </div>
              {commentError && (
                <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-1.5">
                  {commentError}
                </p>
              )}
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-3"
                >
                  <p className="text-xs text-blue-400 font-semibold mb-1">
                    {c.nickname ?? 'Anonimo'}
                  </p>
                  <p className="text-white/80 text-sm">{c.message}</p>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-white/30 py-8">Sé el primero en comentar!</p>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'qr' && (
          <motion.div
            key="qr"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl font-black text-white">Invitar amigos</h2>
            <GlassCard className="p-6" glow="blue">
              <QRCode
                value={inviteUrl}
                size={220}
                style={{ background: 'white', padding: 12, borderRadius: 12 }}
              />
            </GlassCard>
            <p className="text-white/50 text-sm text-center">
              Escanea el QR o comparte el link
            </p>
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-white/60 text-sm break-all">
                {inviteUrl}
              </div>
              <Button onClick={handleCopyLink} variant="secondary" size="lg" className="w-full">
                Copiar link
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: initialEvent.title, url: inviteUrl })
                  }
                }}
                size="lg"
                className="w-full"
              >
                Compartir
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
