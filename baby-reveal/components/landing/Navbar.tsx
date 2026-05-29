'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10">
        {/* Brand */}
        <Link href="/" className="text-white font-black text-lg tracking-tight">
          👶 Baby Revelación
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/login" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/mis-eventos" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
            Mis Revelaciones
          </Link>
          <Link href="/create">
            <Button size="sm" variant="primary">Crear</Button>
          </Link>
        </div>

        {/* Mobile: Iniciar sesión + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/login">
            <Button size="sm" variant="primary">Iniciar sesión</Button>
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            aria-label="Menú"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-white"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white origin-center"
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-[52px] left-0 right-0 z-40 sm:hidden border-b border-white/10"
              style={{
                background: 'rgba(5,5,8,0.97)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex flex-col py-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-6 py-4 text-white/70 font-semibold text-sm hover:text-white hover:bg-white/5 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/mis-eventos"
                  onClick={() => setOpen(false)}
                  className="px-6 py-4 text-white/70 font-semibold text-sm hover:text-white hover:bg-white/5 transition-colors"
                >
                  Mis Revelaciones
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
