import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Оптимизация production сборки
    minify: "terser",
    target: "es2015",
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        // Разделение кода по вендорам для лучшего кеширования
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'gsap-vendor': ['gsap', '@gsap/react'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'form-vendor': ['zod'],
          'query-vendor': ['@tanstack/react-query'],
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
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
    cssMinify: true,
    // Source maps только для production debugging
    sourcemap: false,
    // Оптимизация для production
    reportCompressedSize: true,
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
