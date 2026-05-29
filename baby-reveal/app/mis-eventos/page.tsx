'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { loadGuestId } from '@/utils/guestAuth'

interface MyEvent {
  slug: string
  title: string
  keeper_token: string
  created_at: string
}

interface JoinedEvent {
  slug: string
  title: string
  created_at: string
  nickname: string
}

export default function MisEventosPage() {
  const [events, setEvents] = useState<MyEvent[]>([])
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function load() {
      const local: MyEvent[] = JSON.parse(localStorage.getItem('my_events') || '[]')
      const guestId = loadGuestId()
      const supabase = createClient()

      if (guestId) {
        // Eventos creados
        const { data: created } = await supabase
          .from('events')
          .select('slug, title, keeper_token, created_at')
          .eq('guest_owner_id', guestId)
          .order('created_at', { ascending: false })

        if (created && created.length > 0) {
          const slugsSeen = new Set(created.map((e: MyEvent) => e.slug))
          const merged = [...created, ...local.filter((e) => !slugsSeen.has(e.slug))]
          localStorage.setItem('my_events', JSON.stringify(merged.slice(0, 20)))
          setEvents(merged)
        } else {
          setEvents(local)
        }

        // Eventos en los que participó
        const { data: participations } = await supabase
          .from('participants')
          .select('nickname, event_id, events(slug, title, created_at)')
          .eq('user_id', guestId)
          .order('joined_at', { ascending: false })

        if (participations) {
          const joined: JoinedEvent[] = participations
            .filter((p: any) => p.events)
            .map((p: any) => ({
              slug: p.events.slug,
              title: p.events.title,
              created_at: p.events.created_at,
              nickname: p.nickname,
            }))
          setJoinedEvents(joined)
        }
      } else {
        setEvents(local)
      }

      setMounted(true)
    }
    load()
  }, [])

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← Volver
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Mis Revelaciones</h1>
        <p className="text-white/40 text-sm mb-8">Tus eventos creados y en los que participaste</p>

        {/* Eventos creados */}
        {events.length === 0 && joinedEvents.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/50 mb-6">No tienes eventos aun</p>
            <Link href="/create">
              <Button size="lg">Crear Revelacion 🎊</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-6">
            {events.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">🎊 Creados por ti</p>
                {events.map((ev, i) => {
                  const base = window.location.origin
                  const inviteUrl = `${base}/event/${ev.slug}`
                  const keeperUrl = `${base}/keeper/${ev.slug}/${ev.keeper_token}`
                  return (
                    <motion.div
                      key={ev.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <GlassCard className="p-5" glow="blue">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="font-black text-white text-lg">{ev.title}</h2>
                            <p className="text-white/30 text-xs mt-0.5">
                              {new Date(ev.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <Link href={`/event/${ev.slug}`}>
                            <Button variant="ghost" size="sm">Ver →</Button>
                          </Link>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                          <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">🎉 Link para todos</p>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white/40 text-xs truncate">{inviteUrl}</div>
                            <button onClick={() => copy(inviteUrl, `invite-${ev.slug}`)} className="bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                              {copied === `invite-${ev.slug}` ? '✓' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-yellow-400/60 font-semibold uppercase tracking-widest">🔐 Link secreto (guardiana)</p>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-3 py-2 text-yellow-200/30 text-xs truncate">{keeperUrl}</div>
                            <button onClick={() => copy(keeperUrl, `keeper-${ev.slug}`)} className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/20 rounded-xl px-3 py-2 text-yellow-300 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                              {copied === `keeper-${ev.slug}` ? '✓' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
                <Link href="/create">
                  <Button variant="secondary" size="lg" className="w-full">+ Crear otra Revelacion</Button>
                </Link>
              </div>
            )}

            {/* Eventos participados */}
            {joinedEvents.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">🎉 Eventos en los que participaste</p>
                {joinedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <GlassCard className="p-4" glow="blue">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-black text-white">{ev.title}</h2>
                          <p className="text-white/30 text-xs mt-0.5">Como: <span className="text-blue-400/70">{ev.nickname}</span></p>
                        </div>
                        <Link href={`/event/${ev.slug}`}>
                          <Button variant="ghost" size="sm">Entrar →</Button>
                        </Link>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
