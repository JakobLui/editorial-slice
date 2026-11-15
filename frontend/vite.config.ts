import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    host: true,
    port: 5173,
    // The frontend calls /api/...; Vite forwards those calls to the backend.
    proxy: {
      '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
    },
  },
})
