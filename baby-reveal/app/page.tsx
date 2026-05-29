import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050508]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <Link href="/" className="text-white font-black text-lg tracking-tight">
          👶 Baby Revelación
        </Link>
        <div className="flex items-center gap-3">
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
      </nav>
      <div className="pt-14">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Tu bebe merece el{' '}
            <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
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
    </div>
    </main>
  )
}
