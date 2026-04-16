import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          // Self-destruct in dev so hot-reload isn't blocked by the SW
          devOptions: { enabled: false },
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
          manifest: {
            name: 'EstiMetric: Precision Bidding',
            short_name: 'EstiMetric',
            description: 'High-performance construction bidding and site surveying for tradesmen.',
            theme_color: '#020617',
            background_color: '#020617',
            display: 'standalone',
            orientation: 'portrait-primary',
            start_url: '/',
            icons: [
              { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
              { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
            ]
          },
          workbox: {
            // Pre-cache all built assets
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            // Don't cache AI API calls — they must always be network-first
            navigateFallbackDenylist: [/^\/api\//],
            runtimeCaching: [
              {
                // Firebase Firestore / RTDB: network-first, 1 day stale-while-revalidate
                urlPattern: /^https:\/\/firestore\.googleapis\.com\//,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firestore-cache',
                  networkTimeoutSeconds: 10,
                  expiration: { maxEntries: 50, maxAgeSeconds: 86_400 },
                },
              },
              {
                // Static images (project photos, thumbnails)
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'image-cache',
                  expiration: { maxEntries: 60, maxAgeSeconds: 7 * 86_400 },
                },
              },
              {
                // Google Fonts / CDN assets
                urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'google-fonts-cache' },
              },
            ],
          },
        }),
      ],
      build: {
        rollupOptions: {
          output: {
            // Split the monolith into vendor chunks so the browser can cache
            // them separately between deploys.
            manualChunks: {
              'react-vendor':    ['react', 'react-dom'],
              'framer-vendor':   ['framer-motion'],
              'three-vendor':    ['three'],
              'firebase-vendor': [
                'firebase/app',
                'firebase/auth',
                'firebase/firestore',
              ],
              'ai-vendor':       ['@google/genai'],
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
