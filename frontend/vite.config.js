import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        ws: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  // Strip `console.*` and `debugger` from production bundles only. Dev builds
  // keep them so developers still see logs in the browser console.
  esbuild: mode === 'production'
    ? { drop: ['console', 'debugger'] }
    : {},
}))
