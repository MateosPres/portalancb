import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Define base relativa para funcionar no GitHub Pages em qualquer subdiretório
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});