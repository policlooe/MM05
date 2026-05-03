import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { initGoogleAnalytics } from "./lib/analytics";

// Инициализация Sentry для мониторинга ошибок
initSentry();

// Инициализация Google Analytics
initGoogleAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
