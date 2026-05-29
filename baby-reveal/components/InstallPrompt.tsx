'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('pwa-install-dismissed')) return
    } catch {}

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setShow(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    try { localStorage.setItem('pwa-install-dismissed', '1') } catch {}
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto"
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(29,78,216,0.85) 0%, rgba(8,3,20,0.95) 60%, rgba(236,72,153,0.5) 100%)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            <span className="text-3xl select-none">📱</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Instalar App</p>
              <p className="text-white/50 text-xs mt-0.5">Accede rapido desde tu pantalla de inicio</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="text-white/35 text-xs hover:text-white/60 transition-colors cursor-pointer px-1"
              >
                No
              </button>
              <button
                onClick={handleInstall}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              >
                Instalar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
