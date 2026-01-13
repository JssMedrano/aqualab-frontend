import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://137.131.193.41:3000/api',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        // Preserve all headers
        onProxyReq: (proxyReq, req) => {
          // No cambiar headers existentes
          console.log(`[Proxy] ${req.method} ${req.url}`);
          console.log('[Proxy] Headers:', proxyReq.getHeaders());
        },
        onProxyRes: (proxyRes) => {
          // Agregar headers CORS a la respuesta
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        }
      }
    }
  }
})
