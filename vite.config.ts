import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base path (repo név)
  // Ha custom domain-t használsz, állítsd '/' -re
  base: '/minerva/',
})
