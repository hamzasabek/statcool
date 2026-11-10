import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ('./') allows deploying to any host:
// GitHub Pages (/statcool/), Vercel/Netlify (/), or local preview.
export default defineConfig({
  plugins: [react()],
  base: './',
})


