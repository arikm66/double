import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// DEV PROXY NOTE:
// In development, Vite serves the client on port 5173. The proxy config below forwards any request starting with /api to the backend server (http://localhost:5000).
// This allows you to use relative URLs for API calls in your client code. The browser will show requests going to port 5173, but Vite transparently proxies them to the backend.
// In production, the client and server are served from the same domain, so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // String shorthand: any request starting with /api will go to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})