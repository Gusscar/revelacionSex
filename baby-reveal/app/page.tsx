import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050508]">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Tu bebe merece el{' '}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              reveal perfecto
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Gratis para siempre. Sin tarjeta de credito. Listo en 2 minutos.
          </p>
          <Link href="/create">
            <Button size="xl" variant="primary" className="text-xl px-14 py-6">
              Crear mi Revelacion Gratis 🎊
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-white/30 text-sm flex flex-col items-center gap-3">
        <Link href="/mis-eventos" className="text-white/40 hover:text-white transition-colors text-sm underline underline-offset-4">
          Ver mis revelaciones
        </Link>
        <p>Baby Revelacion 2025 - Hecho con 💖 para las familias</p>
      </footer>
    </main>
  )
}
