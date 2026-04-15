
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Força a atualização do Service Worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifestFilename: 'manifest.json', 
      workbox: {
          // Importa o script do Firebase dentro do Service Worker principal do PWA
          // Isso permite que o PWA gerencie o cache E as notificações background
          importScripts: ['firebase-messaging-sw.js'],
          // Garante que não haja conflitos de cache
          cleanupOutdatedCaches: true,
          // CRUCIAL: Estas opções forçam o novo SW a assumir o controle imediatamente,
          // consertando bugs onde a notificação não chega com o app fechado até a próxima visita.
          skipWaiting: true,
          clientsClaim: true
      },
      manifest: {
        name: 'Portal ANCB | Associacao Nova Canaa de Basquetebol',
        short_name: 'ANCB',
        description: 'Portal oficial da Associacao Nova Canaa de Basquetebol com eventos, ranking, jogadores e resultados.',
        theme_color: '#062553',
        background_color: '#062553',
        display: 'standalone',
        orientation: 'any',
        start_url: "./",
        scope: "./",
        icons: [
          {
            src: 'https://i.imgur.com/SE2jHsz.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.imgur.com/SE2jHsz.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    target: 'es2015', // Aumenta a compatibilidade com iOS/Safari antigos e evita tela branca
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        overlay: resolve(__dirname, 'overlay.html'),
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('firebase')) return 'firebase';
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('html-to-image')) return 'html-to-image';
          if (id.includes('lucide-react')) return 'icons';

          return 'vendor';
        }
      }
    }
  }
});
