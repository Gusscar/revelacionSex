'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

const testimonials = [
  {
    name: 'Maria G.',
    handle: '@mariag_mama',
    text: 'Toda mi familia lloro con el reveal 😭💖 El falso reveal nos hizo gritar! Super viral en TikTok.',
    team: 'girl',
    emoji: '💖',
  },
  {
    name: 'Carlos R.',
    handle: '@carlosreveal',
    text: 'Invite a 80 personas, todos votaron desde sus celulares. Las animaciones son de otro nivel 🔥',
    team: 'boy',
    emoji: '💙',
  },
  {
    name: 'Sofia L.',
    handle: '@sofialuna_',
    text: 'El reveal de cohete espacial fue EPICO. Ya tenemos 2M de vistas en TikTok 🚀',
    team: 'girl',
    emoji: '🚀',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-black text-white mb-4">
          Familias que ya{' '}
          <span className="text-yellow-400">lloraron de emocion</span> 😭
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard
              className="p-6"
              glow={t.team === 'boy' ? 'blue' : 'pink'}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-xl">
                  {t.emoji}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.handle}</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{t.text}</p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
