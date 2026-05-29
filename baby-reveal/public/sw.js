const CACHE_NAME = 'baby-reveal-v3'
const OFFLINE_URL = '/'

const PRECACHE_URLS = [
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return
  if (event.request.url.includes('supabase')) return

  const url = new URL(event.request.url)
  const isNavigation = event.request.mode === 'navigate'
  const isNextData = url.pathname.startsWith('/_next/')
  const isStaticAsset = isNextData && (url.pathname.includes('/_next/static/'))

  // Estáticos con hash (JS/CSS): cache-first, son inmutables
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Páginas HTML y datos: network-first para siempre ver lo último
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && isNavigation) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match(OFFLINE_URL)))
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Baby Reveal', {
      body: data.body ?? 'El reveal esta por comenzar!',
      icon: '/icon',
      badge: '/icon',
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? '/'))
})
