import { lazy } from "react";
import type { ComponentType } from "react";

const RECOVERY_KEY = "mm05:chunk-recovery";

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return /ChunkLoadError|Loading chunk|dynamically imported module|module script failed|Importing a module script failed|Load failed/i.test(
    message
  );
}

async function clearBrowserRuntimeCache() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function recoverFromChunkLoadError(error: unknown) {
  if (!isChunkLoadError(error)) return false;
  if (sessionStorage.getItem(RECOVERY_KEY) === "1") return false;

  sessionStorage.setItem(RECOVERY_KEY, "1");

  clearBrowserRuntimeCache()
    .catch(() => undefined)
    .finally(() => {
      window.location.reload();
    });

  return true;
}

export function lazyWithChunkRecovery<T extends { default: ComponentType<unknown> }>(
  loader: () => Promise<T>
) {
  return lazy(() =>
    loader().catch((error) => {
      recoverFromChunkLoadError(error);
      throw error;
    })
  );
}

export function installChunkErrorRecovery() {
  window.setTimeout(() => sessionStorage.removeItem(RECOVERY_KEY), 5000);

  window.addEventListener("error", (event) => {
    recoverFromChunkLoadError(event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    recoverFromChunkLoadError(event.reason);
  });
}
