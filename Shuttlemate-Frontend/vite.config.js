import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    https:
      {
      key: fs.readFileSync('../Shuttlemate-Backend/ssl/server.key'),
      cert: fs.readFileSync('../Shuttlemate-Backend/ssl/server.crt'),
      },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    }
  }
})
