'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Tab = 'registro' | 'login'

export default function ProfilePage() {
  const [user, setUser] = useState<{ name?: string; email?: string; id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('registro')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name ?? 'Usuario',
          email: data.user.email,
          id: data.user.id,
        })
      }
      setLoading(false)
    })
  }, [])

  function resetForm() {
    setNombre('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  async function handleRegister() {
    setError(null)
    if (!nombre.trim()) return setError('Ingresa tu nombre')
    if (!email.trim()) return setError('Ingresa tu correo')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden')

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: nombre.trim() } },
      })
      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already')) {
          setError('Ya existe una cuenta con ese correo. Intenta iniciar sesión.')
        } else {
          setError(signUpError.message)
        }
        return
      }
      if (data.user) {
        setUser({ name: nombre.trim(), email: email.trim(), id: data.user.id })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogin() {
    setError(null)
    if (!email.trim()) return setError('Ingresa tu correo')
    if (!password) return setError('Ingresa tu contraseña')

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (loginError) {
        setError('Correo o contraseña incorrectos')
        return
      }
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name ?? 'Usuario',
          email: data.user.email,
          id: data.user.id,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    resetForm()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black px-4 py-12">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block">
          ← Volver
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8" glow="purple">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mx-auto mb-6">
              {user ? '👤' : '👶'}
            </div>

            {user ? (
              <>
                <h1 className="text-xl font-black text-white text-center mb-1">
                  Hola, {user.name}!
                </h1>
                <p className="text-white/40 text-sm text-center mb-8">{user.email}</p>
                <Button onClick={handleSignOut} variant="secondary" size="lg" className="w-full">
                  Cerrar sesion
                </Button>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
                  {(['registro', 'login'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); resetForm() }}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                        tab === t ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {t === 'registro' ? 'Registro' : 'Iniciar sesión'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  {tab === 'registro' && (
                    <Input
                      label="Nombre"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  )}
                  <Input
                    label="Correo"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {tab === 'registro' && (
                    <Input
                      label="Confirmar contraseña"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  )}

                  {error && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl p-3">
                      {error}
                    </p>
                  )}

                  <Button
                    onClick={tab === 'registro' ? handleRegister : handleLogin}
                    size="lg"
                    loading={submitting}
                    className="w-full"
                  >
                    {tab === 'registro' ? 'Crear cuenta' : 'Entrar'}
                  </Button>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </main>
  )
}
