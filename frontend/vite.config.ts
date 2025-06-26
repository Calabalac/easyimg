import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8348,
    proxy: {
      '/api': {
        target: 'http://localhost:8347',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8347',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8347',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8347',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
}) 