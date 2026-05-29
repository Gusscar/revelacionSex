import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { InstallPrompt } from '@/components/InstallPrompt'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

export const metadata: Metadata = {
  title: 'Baby Revelacion - La revelacion de genero mas viral',
  description: 'Crea tu evento de revelacion de genero. Vota en tiempo real, reacciones en vivo y animaciones cinematicas que nadie olvidara.',
  keywords: ['baby reveal', 'gender reveal', 'revelacion de genero', 'bebe'],
  openGraph: {
    title: 'Baby Revelacion - La revelacion de genero mas viral',
    description: 'Vota en tiempo real y celebra el momento mas especial.',
    type: 'website',
    siteName: 'Baby Revelacion',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Revelacion',
    description: 'El reveal de genero mas viral del mundo',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Baby Revelacion',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050508',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon" />
        {/* Splash screens iOS */}
        <link rel="apple-touch-startup-image" href="/splash" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body className="min-h-screen bg-[#050508] text-white antialiased">
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <PullToRefresh />
        {children}
      </body>
    </html>
  )
}
