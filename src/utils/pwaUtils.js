/**
 * Service Worker Registration and Update Manager for NammaSahaaya.
 * Supports PWA installation prompts and update triggers.
 */

let registration = null;
let updateCallback = null;

export function registerServiceWorker(onUpdateAvailable) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  updateCallback = onUpdateAvailable;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        console.log('[PWA] Service Worker registered successfully, scope:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] New version available!');
              if (updateCallback) {
                updateCallback();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });

    // Listen for controlling worker change (new SW claimed control)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

/**
 * Triggers skipping waiting for an active waiting worker.
 */
export function applyServiceWorkerUpdate() {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
