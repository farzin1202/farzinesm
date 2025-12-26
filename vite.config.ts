import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/bundle.js',
        assetFileNames: 'assets/bundle.[ext]',
        chunkFileNames: 'assets/[name].js'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});