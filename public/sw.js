/**
 * Service Worker for NammaSahaaya PWA (Phase 5).
 *
 * Implements:
 * 1. Safe Cache Versioning & Pre-caching of App Shell.
 * 2. Stale-While-Revalidate for local assets (JS, CSS, JSON phrases, fonts).
 * 3. Network-First / Cache-Fallback for navigation HTML requests.
 * 4. Offline Fallback for client routes (/situation/*, /explore, /favourites, /settings).
 * 5. Automatic cleanup of outdated caches on new deployments.
 * 6. Protection against caching unwanted 3rd party or sensitive APIs.
 */

const CACHE_NAME = 'nammasahaaya-v4';

// Core Application Shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-icon.svg',
  '/icons.svg'
];

// Install Event — Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache critical shell files
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Activate immediately without waiting for old worker to exit
      return self.skipWaiting();
    })
  );
});

// Activate Event — Clean up stale caches from older deployments
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removing deprecated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim clients immediately so updated SW controls all tabs
      return self.clients.claim();
    })
  );
});

// Fetch Event — Strategic caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML documents for SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, update cache for '/' and index.html
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: serve cached app shell (index.html) so React Router can render offline
          const cache = await caches.open(CACHE_NAME);
          const cachedShell = (await cache.match('/')) || (await cache.match('/index.html'));
          if (cachedShell) {
            return cachedShell;
          }
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>NammaSahaaya Offline</title><style>body{font-family:sans-serif;padding:2rem;text-align:center;color:#1a2332;background:#f7f9fb;}h1{color:#0f4c75;}</style></head><body><h1>NammaSahaaya Offline</h1><p>You appear to be offline. The application requires an initial internet connection to load the offline cache.</p><button onclick="window.location.reload()">Retry Connection</button></body></html>`,
            {
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }

  // 2. Google Fonts stylesheets and webfont files (stale-while-revalidate)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Local Same-Origin Static Assets (Vite built chunks: /assets/*.js, *.css, *.svg, etc.)
  if (url.origin === self.location.origin) {
    // Avoid caching non-essential browser dev tools or websocket requests
    if (url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) {
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Cache Vite assets, JSON phrases, icons, audio files
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((_err) => {
            // If offline, cachedResponse will be returned
            return cachedResponse;
          });

        // Stale-While-Revalidate: return cached immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Do not intercept or cache arbitrary external API calls
});

// Handle SW messages from application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
