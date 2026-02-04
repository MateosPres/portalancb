import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Alterado de './' para '/' para evitar problemas de rota no PWA
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});