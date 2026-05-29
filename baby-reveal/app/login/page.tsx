'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { registerGuest, loginGuest } from '@/services/guestAccounts'
import { saveGuestId, loadGuestId } from '@/utils/guestAuth'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'registro' | 'login'>('registro')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loadGuestId()) router.replace('/mis-eventos')
  }, [])

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) return setError('Ingresa tu nombre')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (tab === 'registro' && password !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    try {
      const account = tab === 'registro'
        ? await registerGuest(name, password)
        : await loginGuest(name, password)
      saveGuestId(account.id)
      router.push('/mis-eventos')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-5xl mb-3">👶</div>
            <h1 className="text-2xl font-black text-white">Baby Revelación</h1>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border border-white/15 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(37,99,235,0.2) 0%, rgba(8,3,20,0.95) 60%, rgba(236,72,153,0.12) 100%)',
            backdropFilter: 'blur(48px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-7 py-8 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {(['registro', 'login'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(null) }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    tab === t ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {t === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              ))}
            </div>

            <p className="text-white/40 text-xs text-center">
              {tab === 'registro'
                ? 'Crea tu cuenta para guardar y gestionar tus revelaciones'
                : 'Ingresa con tu nombre y contraseña'}
            </p>

            {/* Nombre */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre..."
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
            />

            {/* Contraseña */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => tab === 'login' && e.key === 'Enter' && handleSubmit()}
                placeholder="Contraseña..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                {showPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>

            {/* Confirmar contraseña */}
            {tab === 'registro' && (
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Confirmar contraseña..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showConfirm
                    ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base cursor-pointer disabled:opacity-50 transition-all mt-1"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #ec4899 100%)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cargando...
                </span>
              ) : tab === 'registro' ? 'Crear cuenta' : 'Entrar'}
            </button>

            <Link href="/" className="text-white/25 text-xs text-center hover:text-white/50 transition-colors block">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
