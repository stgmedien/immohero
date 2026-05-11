// Self-uninstalling service worker.
// Older versions of this app shipped a PWA service worker via Serwist
// that aggressively cached pages and is now causing 404s on routes the
// old precache manifest doesn't know about. This SW replaces the old
// one, clears all caches, unregisters itself, and forces clients to
// reload so the next request goes straight to the network.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
      const allClients = await self.clients.matchAll({ type: "window" });
      for (const client of allClients) {
        client.navigate(client.url).catch(() => {});
      }
      await self.registration.unregister();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
