/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sport Tracker',
        short_name: 'SportTracker',
        description: 'Track live scores, standings, and upcoming events',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/v3\.football\.api-sports\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-sports-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:js|css|woff2?)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    css: true,
    passWithNoTests: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
