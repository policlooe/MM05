import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Оптимизация production сборки
    minify: "esbuild", // Используем esbuild вместо terser (быстрее)
    target: "es2015", // Поддержка современных браузеров для меньшего размера
    rollupOptions: {
      output: {
        // Разделение кода для оптимизации загрузки
        manualChunks: (id) => {
          // React и основные библиотеки
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            // Radix UI компоненты
            if (id.includes("@radix-ui")) {
              return "ui-vendor";
            }
            // Framer Motion для анимаций
            if (id.includes("framer-motion")) {
              return "animation-vendor";
            }
            // React Query
            if (id.includes("@tanstack/react-query")) {
              return "query-vendor";
            }
            // Остальные зависимости
            return "vendor";
          }
        },
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
    // Source maps только для production debugging
    sourcemap: mode === "production" ? false : true,
    // Оптимизация для production
    reportCompressedSize: false, // Ускоряет сборку
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
  },
}));
