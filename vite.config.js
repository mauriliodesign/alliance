import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4000,
    strictPort: false, // if 4000 is taken, Vite picks the next free port
    open: true,        // auto-open the browser on `npm run dev`
  },
})
