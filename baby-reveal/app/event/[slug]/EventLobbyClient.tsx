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
    currentUserParticipant,
    setCurrentUserParticipant,
    addParticipant,
  } = useEventStore()

  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authDisplayName, setAuthDisplayName] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [tab, setTab] = useState<'lobby' | 'chat' | 'qr'>('lobby')
  const [inviteUrl, setInviteUrl] = useState('')

  useEffect(() => {
    setEvent(initialEvent)
    setParticipants(initialParticipants)
    setInviteUrl(window.location.href)

    const participantKey = `participant_${initialEvent.id}`

    // Intentar restaurar desde el objeto completo guardado en localStorage
    try {
      const raw = localStorage.getItem(participantKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.id && parsed?.event_id === initialEvent.id) {
          // Restaurar inmediatamente — sin red, sin spinner
          setCurrentUserParticipant(parsed as Participant)
          setJoined(true)
          setMounted(true)

          // Refrescar en background para tener datos frescos (voto, etc.)
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
                // El participante ya no existe en la DB
                localStorage.removeItem(participantKey)
                setJoined(false)
              }
            })
          return
        }
        // Formato viejo (solo ID) — limpiar
        localStorage.removeItem(participantKey)
      }
    } catch {
      localStorage.removeItem(`participant_${initialEvent.id}`)
    }

    // Fallback: usuario autenticado reconocido por el servidor
    if (userId) {
      const existing = initialParticipants.find((p) => p.user_id === userId)
      if (existing) {
        setCurrentUserParticipant(existing)
        localStorage.setItem(participantKey, JSON.stringify(existing))
        setJoined(true)
        setMounted(true)
        return
      }

      // Usuario autenticado (vino de Google OAuth) pero aún no tiene participante
      // Pre-llenar su nombre de Google en la pantalla de invitación
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          const name =
            data.user?.user_metadata?.full_name ??
            data.user?.user_metadata?.name ??
            data.user?.email?.split('@')[0] ??
            null
          setAuthDisplayName(name)
          setMounted(true)
        })
      return
    }

    setMounted(true)
  }, [])

  // Mantener localStorage sincronizado cuando el participante cambia (ej: voto)
  useEffect(() => {
    if (!currentUserParticipant) return
    localStorage.setItem(
      `participant_${initialEvent.id}`,
      JSON.stringify(currentUserParticipant)
    )
  }, [currentUserParticipant])

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
  }

  async function handleJoin(name: string) {
    if (!name.trim()) return
    setJoining(true)
    try {
      const supabase = createClient()
      // Obtener el uid actual (puede ser Google o anónimo ya activo)
      let uid = (await supabase.auth.getUser()).data.user?.id ?? null
      if (!uid) {
        const { data } = await supabase.auth.signInAnonymously()
        uid = data.user?.id ?? null
      }
      const participant = await joinEvent({
        event_id: initialEvent.id,
        nickname: name.trim(),
        user_id: uid,
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
    if (!comment.trim()) return
    const newComment = await sendComment({
      event_id: initialEvent.id,
      user_id: userId,
      nickname: currentUserParticipant?.nickname,
      message: comment.trim(),
    })
    setComments((prev) => [newComment, ...prev])
    setComment('')
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(inviteUrl)
  }

  // Esperar a que el useEffect lea localStorage antes de decidir qué mostrar
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    )
  }

  if (!joined && !isOwner) {
    return (
      <InvitationScreen
        event={initialEvent}
        onJoin={handleJoin}
        onGoogleSignIn={handleGoogleSignIn}
        joining={joining}
        authDisplayName={authDisplayName}
      />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black">
      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto flex">
          {(['lobby', 'chat', 'qr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
                tab === t
                  ? 'text-white border-b-2 border-purple-400'
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
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Escribe algo..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              />
              <Button onClick={handleComment} size="md" className="flex-shrink-0">
                Enviar
              </Button>
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
                  <p className="text-xs text-purple-400 font-semibold mb-1">
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
            <GlassCard className="p-6" glow="purple">
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
