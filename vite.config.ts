import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cho phép truy cập từ ngoài máy (LAN / tunnel như Cloudflare Tunnel, ngrok...)
    host: true,
    // Vite 5+ chặn Host header lạ mặc định - tunnel domain đổi mỗi lần chạy nên không thể whitelist cố định.
    allowedHosts: true,
    proxy: {
      // Proxy /api sang backend để browser chỉ thấy 1 origin duy nhất (Vite) - tránh CORS
      // và giữ cookie refresh token (SameSite=Lax) hoạt động đúng khi expose qua tunnel.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
