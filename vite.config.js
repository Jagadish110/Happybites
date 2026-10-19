import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expose on the local network, not just localhost
    port: 5173,
    // the browser talks to one origin; /api goes to the Node server
    proxy: { '/api': 'http://localhost:8787' },
  },
})
