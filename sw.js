// Service worker: η εφαρμογή ανοίγει και χωρίς σύνδεση μετά την πρώτη επίσκεψη.
const CACHE = 'diastaseis-v5';
const SHELL = ['./', './index.html', './dimensions.html', './manifest.webmanifest',
  './hypercube-math.pdf', './dimensions-doc.pdf',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Πρώτα από την cache, και ενημέρωση από το δίκτυο στο παρασκήνιο (three.js, React, γραμματοσειρές, σελίδες).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || net;
  }));
});
