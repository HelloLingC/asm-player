import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  // Prevent Vite from clearing console logs in dev
  clearScreen: false,
})