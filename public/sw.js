const CACHE = 'movement-os-v4'
const CORE = ['./', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const response = await fetch('./index.html')
    const html = await response.clone().text()
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(path => path.startsWith('./'))
    await cache.put('./index.html', response)
    await cache.addAll([...new Set([...CORE, ...assets])])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch:true, ignoreVary:true })
    if (cached) return cached
    try {
      const response = await fetch(event.request)
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE)
        await cache.put(event.request, response.clone())
      }
      return response
    } catch {
      if (event.request.mode === 'navigate') return caches.match('./index.html')
      return Response.error()
    }
  })())
})
