import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
        manifest: {
          name: 'MindVault',
          short_name: 'MindVault',
          description: "Everything you've ever found worth keeping.",
          theme_color: '#1a1a2e',
          background_color: '#1a1a2e',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          categories: ['productivity', 'utilities'],
          shortcuts: [
            { name: 'Quick Add', url: '/?capture=true', description: 'Quickly add a new card' },
            { name: 'Focus Timer', url: '/timer', description: 'Start a focus session' },
            { name: 'Music', url: '/music', description: 'Open music library' },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'gstatic-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', networkTimeoutSeconds: 10, expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
            'query-vendor':  ['@tanstack/react-query'],
            'motion-vendor': ['framer-motion'],
            'utils-vendor':  ['axios', 'zustand', 'date-fns'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
      },
      cssCodeSplit: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api':   { target: apiTarget, changeOrigin: true },
        '/media': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
