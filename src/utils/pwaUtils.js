/**
 * Service Worker Registration and Update Manager for NammaSahaaya.
 * Supports PWA installation prompts, offline cache inspection, and storage estimations.
 */

let registration = null;
let updateCallback = null;
let deferredInstallPrompt = null;
const installListeners = new Set();

// Listen for beforeinstallprompt early
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installListeners.forEach((fn) => {
      try { fn(); } catch {}
    });
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((fn) => {
      try { fn(); } catch {}
    });
  });
}

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

/**
 * Returns the current Service Worker registration.
 */
export function getServiceWorkerRegistration() {
  return registration;
}

/**
 * Checks if the app is currently running in standalone (installed) mode.
 */
export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = window.navigator && window.navigator.standalone === true;
  return Boolean(isStandalone || isIosStandalone);
}

/**
 * Returns install prompt readiness and action trigger.
 */
export function getInstallPrompt() {
  return {
    canInstall: Boolean(deferredInstallPrompt),
    prompt: async () => {
      if (!deferredInstallPrompt) return false;
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          deferredInstallPrompt = null;
          installListeners.forEach((fn) => { try { fn(); } catch {} });
          return true;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      return false;
    }
  };
}

/**
 * Subscribes to changes in install prompt availability.
 */
export function onInstallPromptChange(callback) {
  installListeners.add(callback);
  return () => {
    installListeners.delete(callback);
  };
}

/**
 * Inspects all cached items across current CacheStorage.
 * Returns the number of cached assets and the active cache names.
 */
export async function getCacheDetails() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { supported: false, totalCached: 0, cacheNames: [] };
  }

  try {
    const keys = await caches.keys();
    let totalCached = 0;
    for (const name of keys) {
      try {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        totalCached += requests.length;
      } catch {
        // Continue if single cache fails
      }
    }
    return { supported: true, totalCached, cacheNames: keys };
  } catch (err) {
    console.warn('Error reading caches:', err);
    return { supported: true, totalCached: 0, cacheNames: [] };
  }
}

/**
 * Safely inspects storage quota and usage.
 * Returns formatted bytes and percent.
 */
export async function getStorageEstimate() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.storage ||
    typeof navigator.storage.estimate !== 'function'
  ) {
    return { supported: false, usedText: null, totalText: null, percent: null };
  }

  try {
    const { usage, quota } = await navigator.storage.estimate();
    const formatBytes = (bytes) => {
      if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const percent = quota > 0 ? ((usage / quota) * 100).toFixed(1) : '0';

    return {
      supported: true,
      usageBytes: usage,
      quotaBytes: quota,
      usedText: formatBytes(usage),
      totalText: formatBytes(quota),
      percent: Number(percent)
    };
  } catch (err) {
    console.warn('Error getting storage estimate:', err);
    return { supported: false, usedText: null, totalText: null, percent: null };
  }
}

/**
 * Triggers re-caching of all routes and assets via the controlling Service Worker.
 */
export function prepareOfflineAssets(onProgress, onSuccess, onFailure) {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    onFailure(new Error('Service Worker is not supported in this browser.'));
    return;
  }

  const controller = navigator.serviceWorker.controller;
  if (!controller) {
    onFailure(new Error('Service Worker is not currently controlling the page. Please reload the page first.'));
    return;
  }

  const messageHandler = (event) => {
    if (!event.data) return;
    if (event.data.type === 'PREPARE_OFFLINE_PROGRESS') {
      if (onProgress) onProgress(event.data);
    } else if (event.data.type === 'PREPARE_OFFLINE_SUCCESS') {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      if (onSuccess) onSuccess(event.data);
    } else if (event.data.type === 'PREPARE_OFFLINE_FAILURE') {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      if (onFailure) onFailure(new Error(event.data.error || 'Failed to prepare offline cache'));
    }
  };

  navigator.serviceWorker.addEventListener('message', messageHandler);
  controller.postMessage({ type: 'PREPARE_OFFLINE' });
}
