import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Força a atualização do Service Worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Portal ANCB-MT',
        short_name: 'ANCB',
        description: 'Portal da Associação de Amigos do Basquetebol de Nova Canaã do Norte - MT',
        theme_color: '#062553',
        background_color: '#062553',
        display: 'standalone',
        orientation: 'portrait',
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
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});