'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { registerGuest, loginGuest } from '@/services/guestAccounts'
import { saveGuestId, loadGuestId } from '@/utils/guestAuth'

export function AuthModal() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState<'registro' | 'login'>('registro')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLoggedIn(!!loadGuestId())
  }, [open])

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
      setLoggedIn(true)
      setOpen(false)
      setName(''); setPassword(''); setConfirm('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('guest_account_id')
    setLoggedIn(false)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white/60 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
      >
        {loggedIn ? '👤 Mi cuenta' : 'Iniciar sesión'}
      </button>

      <AnimatePresence>
        {open && mounted && createPortal(
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[101] px-4 pointer-events-none"
            >
            <div className="w-full max-w-sm pointer-events-auto">
              <div className="rounded-3xl border border-white/20 overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(37,99,235,0.25) 0%, rgba(8,3,20,0.95) 60%, rgba(236,72,153,0.15) 100%)',
                  backdropFilter: 'blur(48px)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                }}>
                <div className="px-7 py-7 flex flex-col gap-4">
                  {loggedIn ? (
                    <>
                      <div className="text-center">
                        <div className="text-4xl mb-2">👤</div>
                        <h2 className="text-xl font-black text-white">Tu cuenta</h2>
                        <p className="text-white/40 text-sm mt-1">Sesión activa en este dispositivo</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all cursor-pointer"
                      >
                        Cerrar sesión
                      </button>
                      <button onClick={() => setOpen(false)}
                        className="text-white/25 text-xs text-center hover:text-white/50 transition-colors cursor-pointer">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-1">
                        <div className="text-4xl mb-2">👶</div>
                        <h2 className="text-xl font-black text-white">Tu cuenta</h2>
                      </div>

                      <div className="flex rounded-xl overflow-hidden border border-white/10">
                        {(['registro', 'login'] as const).map((t) => (
                          <button key={t} onClick={() => { setTab(t); setError(null) }}
                            className={`flex-1 py-2 text-sm font-semibold transition-all cursor-pointer ${
                              tab === t ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white/70'
                            }`}>
                            {t === 'registro' ? 'Registro' : 'Iniciar sesión'}
                          </button>
                        ))}
                      </div>

                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre..."
                        autoFocus
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
                      />

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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                          {showPassword ? '🙈' : '👁'}
                        </button>
                      </div>

                      {tab === 'registro' && (
                        <input
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                          placeholder="Confirmar contraseña..."
                          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all text-sm font-semibold"
                        />
                      )}

                      {error && (
                        <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl font-black text-white text-base cursor-pointer disabled:opacity-50 transition-all"
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
                        ) : tab === 'registro' ? 'Registrarse' : 'Iniciar sesión'}
                      </button>

                      <button onClick={() => setOpen(false)}
                        className="text-white/25 text-xs text-center hover:text-white/50 transition-colors cursor-pointer">
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </>
  )
}
