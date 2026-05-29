'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { REVEAL_THEMES, Event } from '@/types'
import { createEvent } from '@/services/events'
import { createClient } from '@/lib/supabase/client'
import { loadGuestId, saveGuestId } from '@/utils/guestAuth'
import { registerGuest, loginGuest } from '@/services/guestAccounts'

const schema = z.object({
  title: z.string().min(3, 'Minimo 3 caracteres').max(60, 'Maximo 60 caracteres'),
  baby_name: z.string().optional(),
  reveal_date: z.string().min(1, 'Selecciona una fecha'),
  theme: z.string(),
  reveal_mode: z.enum(['countdown', 'instant', 'dramatic']),
})

type FormValues = z.infer<typeof schema>

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null)
  const [copied, setCopied] = useState<'invite' | 'keeper' | null>(null)

  // Auth step before creating event
  const [authStep, setAuthStep] = useState(false)
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)
  const [authTab, setAuthTab] = useState<'registro' | 'login'>('registro')
  const [authName, setAuthName] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirm, setAuthConfirm] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { theme: 'confetti', reveal_mode: 'dramatic' },
  })

  const selectedTheme = watch('theme')

  async function createTheEvent(values: FormValues) {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const { data } = await supabase.auth.signInAnonymously().catch(() => ({ data: { user: null } }))
        user = data?.user ?? null
      }

      const event = await createEvent({
        title: values.title,
        baby_name: values.baby_name || undefined,
        reveal_date: values.reveal_date,
        theme: values.theme,
        reveal_mode: values.reveal_mode,
        owner_id: user?.id ?? null,
        guest_owner_id: loadGuestId(),
      })

      // Save keeper token locally so the creator can recover it
      try {
        localStorage.setItem(`keeper_${event.slug}`, event.keeper_token)
      } catch {}

      // Guardar en localStorage para recuperar links después
      const myEvents = JSON.parse(localStorage.getItem('my_events') || '[]')
      myEvents.unshift({ slug: event.slug, title: event.title, keeper_token: event.keeper_token, created_at: event.created_at })
      localStorage.setItem('my_events', JSON.stringify(myEvents.slice(0, 20)))

      setCreatedEvent(event)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el evento')
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    await createTheEvent(values)
  }

  async function handleAuth() {
    setAuthError(null)
    if (!authName.trim()) return setAuthError('Ingresa tu nombre')
    if (authPassword.length < 6) return setAuthError('La contraseña debe tener al menos 6 caracteres')
    if (authTab === 'registro' && authPassword !== authConfirm) return setAuthError('Las contraseñas no coinciden')
    setAuthLoading(true)
    try {
      const account = authTab === 'registro'
        ? await registerGuest(authName, authPassword)
        : await loginGuest(authName, authPassword)
      saveGuestId(account.id)
      setAuthStep(false)
      if (pendingValues) await createTheEvent(pendingValues)
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setAuthLoading(false)
    }
  }

  async function copyLink(type: 'invite' | 'keeper') {
    if (!createdEvent) return
    const base = window.location.origin
    const url = type === 'invite'
      ? `${base}/event/${createdEvent.slug}`
      : `${base}/keeper/${createdEvent.slug}/${createdEvent.keeper_token}`
    await navigator.clipboard.writeText(url)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // AUTH STEP
  if (authStep) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black px-4 py-12 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <GlassCard className="p-7 flex flex-col gap-4">
            <div className="text-center mb-2">
              <div className="text-4xl mb-3">👶</div>
              <h2 className="text-xl font-black text-white">Crea tu cuenta</h2>
              <p className="text-white/40 text-sm mt-1">Para poder ver tus revelaciones después</p>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {(['registro', 'login'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setAuthTab(t); setAuthError(null) }}
                  className={`flex-1 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    authTab === t ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {t === 'registro' ? 'Registro' : 'Iniciar sesión'}
                </button>
              ))}
            </div>

            <input
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              placeholder="Tu nombre..."
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Contraseña..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {authTab === 'registro' && (
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={authConfirm}
                  onChange={(e) => setAuthConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Confirmar contraseña..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            )}

            {authError && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-xl px-3 py-2">{authError}</p>
            )}

            <Button onClick={handleAuth} size="lg" loading={authLoading} className="w-full">
              {authTab === 'registro' ? 'Registrarse y Crear Evento' : 'Iniciar sesión y Crear Evento'}
            </Button>

            <button onClick={() => setAuthStep(false)}
              className="text-white/25 text-xs text-center hover:text-white/50 transition-colors cursor-pointer">
              ← Volver al formulario
            </button>
          </GlassCard>
        </motion.div>
      </main>
    )
  }

  // SUCCESS SCREEN
  if (createdEvent) {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteUrl = `${base}/event/${createdEvent.slug}`
    const keeperUrl = `${base}/keeper/${createdEvent.slug}/${createdEvent.keeper_token}`

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col gap-5"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              🎊
            </motion.div>
            <h1 className="text-3xl font-black text-white">Evento creado!</h1>
            <p className="text-white/50 mt-2">Ahora comparte los links correctos con cada persona</p>
          </div>

          {!loadGuestId() && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 text-yellow-300/80 text-sm text-center">
              💡 <span className="font-semibold">Tip:</span> Regístrate desde <span className="font-semibold">Iniciar sesión</span> en el menú para recuperar este evento aunque pierdas el historial.
            </div>
          )}

          {/* Invite link - for everyone */}
          <GlassCard className="p-5" glow="blue">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-black text-white text-lg">Link para todos</p>
                <p className="text-white/50 text-sm">Comparte esto con familia y amigos — incluido tú</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl px-3 py-2 text-white/50 text-xs break-all mb-3">
              {inviteUrl}
            </div>
            <Button onClick={() => copyLink('invite')} variant="secondary" size="md" className="w-full">
              {copied === 'invite' ? '✓ Copiado!' : 'Copiar link de invitacion'}
            </Button>
            {navigator?.share && (
              <Button
                onClick={() => navigator.share({ title: createdEvent.title, url: inviteUrl })}
                size="md"
                className="w-full mt-2"
              >
                Compartir por WhatsApp
              </Button>
            )}
          </GlassCard>

          {/* Keeper link - secret */}
          <GlassCard className="p-5 border-yellow-500/30" glow="none">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🔐</span>
              <div>
                <p className="font-black text-white text-lg">Link secreto</p>
                <p className="text-white/50 text-sm">
                  Solo para <span className="text-yellow-400 font-semibold">la persona que sabe el sexo</span>. Ella controla el reveal.
                </p>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-yellow-200/50 text-xs break-all mb-3">
              {keeperUrl}
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-300 text-xs mb-3">
              ⚠️ NO compartas este link con nadie más. Solo la guardiana del secreto.
            </div>
            <Button
              onClick={() => copyLink('keeper')}
              variant="danger"
              size="md"
              className="w-full"
            >
              {copied === 'keeper' ? '✓ Copiado!' : 'Copiar link secreto'}
            </Button>
          </GlassCard>

          <Link href={`/event/${createdEvent.slug}`}>
            <Button variant="ghost" size="md" className="w-full">
              Ir al lobby →
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← Volver
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-white mb-1">Crear Revelacion 🎊</h1>
          <p className="text-white/50 mb-8">
            Tu solo configuras el evento. La guardiana del secreto se encarga del nombre y del reveal.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <GlassCard className="p-6 flex flex-col gap-4">
              <h2 className="font-bold text-white/70 text-sm uppercase tracking-widest">Info del evento</h2>
              <Input
                label="Titulo del evento"
                placeholder="Ej: Revelacion de Baby Garcia"
                error={errors.title?.message}
                {...register('title')}
              />
              <Input
                label="Fecha y hora del reveal"
                type="datetime-local"
                error={errors.reveal_date?.message}
                {...register('reveal_date')}
              />
            </GlassCard>

            {/* Theme */}
            <GlassCard className="p-6">
              <h2 className="font-bold text-white/70 text-sm uppercase tracking-widest mb-4">Tema del reveal</h2>
              <div className="grid grid-cols-2 gap-2">
                {REVEAL_THEMES.map((theme) => (
                  <motion.button
                    key={theme.value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setValue('theme', theme.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      selectedTheme === theme.value
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xl">{theme.emoji}</span>
                    <span className="text-sm font-medium">{theme.label}</span>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Mode */}
            <GlassCard className="p-6">
              <h2 className="font-bold text-white/70 text-sm uppercase tracking-widest mb-4">Modo de reveal</h2>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'dramatic', label: 'Dramatico', desc: 'Falsos reveals + suspenso maximo + momento epico' },
                  { value: 'countdown', label: 'Countdown', desc: 'Cuenta regresiva hasta la hora exacta' },
                  { value: 'instant', label: 'Instantaneo', desc: 'La guardiana revela cuando ella quiera' },
                ].map((mode) => (
                  <motion.button
                    key={mode.value}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setValue('reveal_mode', mode.value as FormValues['reveal_mode'])}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      watch('reveal_mode') === mode.value
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                      watch('reveal_mode') === mode.value ? 'border-blue-400 bg-blue-400' : 'border-white/30'
                    }`} />
                    <div>
                      <p className="font-semibold text-white text-sm">{mode.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{mode.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl p-3">{error}</p>
            )}

            <Button type="submit" size="xl" loading={loading} className="w-full">
              Crear Revelacion 🎊
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
