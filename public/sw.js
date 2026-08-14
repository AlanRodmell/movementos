const CACHE = 'movement-os-v5'
const CORE = ['./', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const response = await fetch('./index.html', { cache:'reload' })
    if (!response.ok) throw new Error('Unable to cache the app shell')
    const html = await response.clone().text()
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(path => path.startsWith('./'))
    await cache.put('./index.html', response)
    await Promise.allSettled([...new Set([...CORE, ...assets])].map(async path => {
      const asset = await fetch(path, { cache:'reload' })
      if (asset.ok) await cache.put(path, asset)
    }))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('movement-os-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith((async () => {
    const url = new URL(event.request.url)
    if (url.origin !== self.location.origin) return fetch(event.request)
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request, { cache:'no-store' })
        if (response.ok) {
          const cache = await caches.open(CACHE)
          await cache.put('./index.html', response.clone())
        }
        return response
      } catch {
        return (await caches.match('./index.html')) || Response.error()
      }
    }
    const cached = await caches.match(event.request)
    if (cached) return cached
    try {
      const response = await fetch(event.request)
      if (response.ok) {
        const cache = await caches.open(CACHE)
        await cache.put(event.request, response.clone())
      }
      return response
    } catch {
      return Response.error()
    }
  })())
})
