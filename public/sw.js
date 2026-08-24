// Service worker mínimo para satisfacer criterios de PWA instalable
// NO implementa cacheo offline - todo va a la red
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});