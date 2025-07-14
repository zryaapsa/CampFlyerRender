import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Semua request yang diawali dengan /api akan diteruskan ke backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})