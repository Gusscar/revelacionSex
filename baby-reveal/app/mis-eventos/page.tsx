'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

interface MyEvent {
  slug: string
  title: string
  keeper_token: string
  created_at: string
}

export default function MisEventosPage() {
  const [events, setEvents] = useState<MyEvent[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('my_events') || '[]')
    setEvents(saved)
    setMounted(true)
  }, [])

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← Volver
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Mis Revelaciones</h1>
        <p className="text-white/40 text-sm mb-8">Eventos que creaste desde este dispositivo</p>

        {events.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/50 mb-6">No tienes eventos creados aun</p>
            <Link href="/create">
              <Button size="lg">Crear Revelacion 🎊</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-4">
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
                  <GlassCard className="p-5" glow="purple">
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

                    {/* Invite link */}
                    <div className="flex flex-col gap-2 mb-3">
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">
                        🎉 Link para todos
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white/40 text-xs truncate">
                          {inviteUrl}
                        </div>
                        <button
                          onClick={() => copy(inviteUrl, `invite-${ev.slug}`)}
                          className="bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                        >
                          {copied === `invite-${ev.slug}` ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Keeper link */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-yellow-400/60 font-semibold uppercase tracking-widest">
                        🔐 Link secreto (guardiana)
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-3 py-2 text-yellow-200/30 text-xs truncate">
                          {keeperUrl}
                        </div>
                        <button
                          onClick={() => copy(keeperUrl, `keeper-${ev.slug}`)}
                          className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/20 rounded-xl px-3 py-2 text-yellow-300 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                        >
                          {copied === `keeper-${ev.slug}` ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}

            <Link href="/create" className="mt-2">
              <Button variant="secondary" size="lg" className="w-full">
                + Crear otra Revelacion
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
