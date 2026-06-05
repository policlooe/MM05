import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import { installChunkErrorRecovery } from "./lib/chunk-recovery";
import { initCsrfProtection } from "./lib/csrf";

// Initialize CSRF protection
initCsrfProtection();
installChunkErrorRecovery();

// Remove the old cache-first service worker. It can serve stale hashed chunks
// after deploys, which is especially visible as blank screens in iOS Safari.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => undefined);

    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
