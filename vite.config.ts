import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Оптимизация production сборки
    minify: "esbuild",
    target: "es2015",
    rollupOptions: {
      output: {
        // Упрощенное разделение кода - убираем сложную логику
        manualChunks: undefined,
        // Оптимизация имен файлов для кеширования
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Увеличиваем лимит для предупреждений о размере чанков
    chunkSizeWarningLimit: 1000,
    // Оптимизация CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Source maps только для production debugging
    sourcemap: false,
    // Оптимизация для production
    reportCompressedSize: false,
    // Оптимизация ассетов
    assetsInlineLimit: 4096, // 4kb
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react-router-dom", 
      "@tanstack/react-query",
      "framer-motion",
      "zustand"
    ],
    exclude: ['@tanstack/react-query-devtools'],
  },
  // Оптимизация dev сервера
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
}));
