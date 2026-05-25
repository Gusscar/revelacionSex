'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Event, Participant } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRealtimeEvent } from '@/hooks/useRealtimeEvent'
import { useEventStore } from '@/store/eventStore'
import { triggerKeeperReveal, triggerFakeReveal } from '@/services/events'
import { createClient } from '@/lib/supabase/client'

interface Props {
  event: Event
  initialParticipants: Participant[]
  token: string
}

export function KeeperClient({ event, initialParticipants, token }: Props) {
  const { setEvent, setParticipants, voteStats, participants } = useEventStore()
  const [selectedGender, setSelectedGender] = useState<'boy' | 'girl' | null>(
    event.result as 'boy' | 'girl' | null
  )
  const [confirming, setConfirming] = useState(false)
  const [revealed, setRevealed] = useState(event.is_revealed)
  const [fakeLoading, setFakeLoading] = useState(false)
  const [revealLoading, setRevealLoading] = useState(false)
  const [locked, setLocked] = useState(!!event.result)

  // Baby name state — managed by keeper
  const [babyName, setBabyName] = useState(event.baby_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(!!event.baby_name)

  useEffect(() => {
    setEvent(event)
    setParticipants(initialParticipants)
  }, [])

  useRealtimeEvent(event.id)

  async function handleSaveBabyName() {
    if (!babyName.trim()) return
    setSavingName(true)
    try {
      const supabase = createClient()
      await supabase
        .from('events')
        .update({ baby_name: babyName.trim() })
        .eq('id', event.id)
        .eq('keeper_token', token)
      setNameSaved(true)
    } finally {
      setSavingName(false)
    }
  }

  async function handleFakeReveal() {
    setFakeLoading(true)
    try {
      await triggerFakeReveal(event.id)
    } finally {
      setFakeLoading(false)
    }
  }

  async function handleRealReveal() {
    if (!selectedGender) return
    setRevealLoading(true)
    try {
      await triggerKeeperReveal(event.id, token, selectedGender)
      setRevealed(true)
    } finally {
      setRevealLoading(false)
    }
  }

  const isBoy = selectedGender === 'boy'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-1.5 text-yellow-300 text-sm font-semibold mb-4">
            🔐 Panel Secreto
          </div>
          <h1 className="text-2xl font-black text-white">{event.title}</h1>
          <p className="text-white/40 text-sm mt-1">Solo tu sabes la verdad</p>
        </div>

        {/* Baby name — keeper sets this */}
        <GlassCard className="p-5 border-yellow-500/20">
          <p className="text-xs font-bold text-yellow-400/70 uppercase tracking-widest mb-3">
            Nombre del bebe 👶
          </p>
          {!nameSaved ? (
            <>
              <p className="text-white/40 text-xs mb-3">
                El padre no sabe si es niño o niña, por eso no puso el nombre. Tu decides cual va.
              </p>
              <div className="flex gap-2">
                <input
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveBabyName()}
                  placeholder="Ej: Sofia, Mateo..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 text-sm"
                />
                <Button
                  onClick={handleSaveBabyName}
                  loading={savingName}
                  variant="secondary"
                  size="md"
                  className="flex-shrink-0"
                >
                  Guardar
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">👶</span>
                <span className="text-white font-black text-xl">Baby {babyName}</span>
              </div>
              <button
                onClick={() => setNameSaved(false)}
                className="text-white/30 text-xs underline cursor-pointer"
              >
                Cambiar
              </button>
            </motion.div>
          )}
        </GlassCard>

        {/* Vote stats - real time */}
        <GlassCard className="p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
            Como va la votacion ({voteStats.total} votos)
          </p>
          <div className="flex rounded-full overflow-hidden h-4 bg-white/10 mb-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full"
              animate={{ width: `${voteStats.boyPercent}%` }}
              transition={{ duration: 0.8 }}
            />
            <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-full flex-1" />
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-blue-400">💙 Niño {voteStats.boyPercent}% ({voteStats.boy})</span>
            <span className="text-pink-400">Niña {voteStats.girlPercent}% ({voteStats.girl}) 💖</span>
          </div>
          {participants.length > 0 && (
            <p className="text-center text-white/30 text-xs mt-3">
              {participants.length} persona{participants.length !== 1 ? 's' : ''} en el evento
            </p>
          )}
        </GlassCard>

        {/* Secret gender selection */}
        <GlassCard className="p-5 border-yellow-500/20">
          <p className="text-xs font-bold text-yellow-400/70 uppercase tracking-widest mb-4">
            El secreto que guardas 🤫
          </p>

          {!locked ? (
            <>
              <p className="text-white/50 text-sm mb-4">
                Selecciona el sexo. Nadie lo vera hasta que tu dispares el reveal.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGender('boy')}
                  className={`py-5 rounded-2xl border-2 text-center font-black text-xl cursor-pointer transition-all ${
                    selectedGender === 'boy'
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20'
                      : 'border-white/10 text-white/30'
                  }`}
                >
                  💙<br />
                  <span className="text-base">Niño</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGender('girl')}
                  className={`py-5 rounded-2xl border-2 text-center font-black text-xl cursor-pointer transition-all ${
                    selectedGender === 'girl'
                      ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-lg shadow-pink-500/20'
                      : 'border-white/10 text-white/30'
                  }`}
                >
                  💖<br />
                  <span className="text-base">Niña</span>
                </motion.button>
              </div>
              {selectedGender && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={() => setLocked(true)}
                    variant={isBoy ? 'boy' : 'girl'}
                    size="lg"
                    className="w-full"
                  >
                    Confirmar: Es {isBoy ? 'Niño 💙' : 'Niña 💖'}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              <div
                className={`text-5xl font-black mb-2 ${isBoy ? 'text-blue-400' : 'text-pink-400'}`}
                style={{ filter: revealed ? 'none' : 'blur(8px)', transition: 'filter 0.5s' }}
              >
                {isBoy ? 'NIÑO 💙' : 'NIÑA 💖'}
              </div>
              {!revealed && (
                <>
                  <p className="text-white/30 text-xs">Guardado — borroso hasta el reveal</p>
                  <button
                    onClick={() => setLocked(false)}
                    className="text-white/30 text-xs underline mt-2 cursor-pointer"
                  >
                    Cambiar seleccion
                  </button>
                </>
              )}
            </motion.div>
          )}
        </GlassCard>

        {/* Controls */}
        {!revealed && locked && (
          <GlassCard className="p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Controles del reveal
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleFakeReveal}
                variant="danger"
                size="lg"
                loading={fakeLoading}
                className="w-full"
              >
                😈 Lanzar Falsa Revelacion
              </Button>
              <p className="text-white/30 text-xs text-center">
                Trollea a todos antes del gran momento
              </p>

              <div className="border-t border-white/10 pt-3 mt-1">
                {!confirming ? (
                  <Button
                    onClick={() => setConfirming(true)}
                    variant={isBoy ? 'boy' : 'girl'}
                    size="xl"
                    className="w-full text-xl"
                  >
                    🎊 REVELAR AHORA
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-3"
                  >
                    <p className="text-center text-white font-bold">
                      Esto revelara el sexo a TODOS. Estas segura?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => setConfirming(false)} variant="secondary" size="lg">
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRealReveal}
                        variant={isBoy ? 'boy' : 'girl'}
                        size="lg"
                        loading={revealLoading}
                      >
                        SI, REVELAR!
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Already revealed */}
        {revealed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="p-6 text-center" glow={isBoy ? 'blue' : 'pink'}>
              <div
                className="text-6xl font-black mb-3"
                style={{
                  textShadow: isBoy ? '0 0 40px #3b82f6' : '0 0 40px #ec4899',
                  color: isBoy ? '#3b82f6' : '#ec4899',
                }}
              >
                {isBoy ? 'NIÑO 💙' : 'NIÑA 💖'}
              </div>
              {babyName && (
                <p className="text-white/60 text-lg">Baby {babyName}</p>
              )}
              <p className="text-white/40 text-sm mt-2">El secreto fue revelado a todos!</p>
            </GlassCard>
          </motion.div>
        )}

      </div>
    </main>
  )
}
