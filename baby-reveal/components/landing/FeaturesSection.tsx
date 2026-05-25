'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

const features = [
  {
    icon: '🎊',
    title: 'Revelacion Cinematica',
    desc: '10 temas premium: fuegos artificiales, confetti, casino y mas. Animaciones que hacen llorar.',
  },
  {
    icon: '⚡',
    title: 'Tiempo Real',
    desc: 'Votos, reacciones y comentarios sincronizados al instante con todos los invitados.',
  },
  {
    icon: '😈',
    title: 'Falsas Revelaciones',
    desc: 'Trollea a tu familia con fake reveals y efectos glitch antes del gran momento.',
  },
  {
    icon: '📱',
    title: 'Viral por Diseno',
    desc: 'Genera clips para TikTok e Instagram automaticamente. Disenado para compartir.',
  },
  {
    icon: '🏆',
    title: 'Gamificacion',
    desc: 'Leaderboard de quien adivino, badges y premios para los participantes.',
  },
  {
    icon: '🔗',
    title: 'Sin Registro',
    desc: 'Los invitados entran con un link o QR. Sin apps, sin formularios, cero fricciones.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Todo lo que necesitas para el{' '}
          <span className="text-pink-400">momento perfecto</span>
        </h2>
        <p className="text-white/50 text-lg">Creado para la generacion TikTok</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-6 h-full hover:border-purple-500/40 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
