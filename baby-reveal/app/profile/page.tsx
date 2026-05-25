'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email, id: data.user.id } : null)
      setLoading(false)
    })
  }, [])

  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profile` },
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
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
          <GlassCard className="p-8 text-center" glow="purple">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mx-auto mb-6">
              {user ? '👤' : '👶'}
            </div>

            {user ? (
              <>
                <h1 className="text-xl font-black text-white mb-1">
                  {user.email ?? 'Usuario Anonimo'}
                </h1>
                <p className="text-white/40 text-sm mb-8">ID: {user.id.slice(0, 8)}...</p>
                <Button
                  onClick={handleSignOut}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Cerrar sesion
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-xl font-black text-white mb-2">Iniciar sesion</h1>
                <p className="text-white/50 text-sm mb-8">
                  Guarda tus eventos y aparece en el leaderboard
                </p>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleSignIn} size="lg" className="w-full">
                    Continuar con Google
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
