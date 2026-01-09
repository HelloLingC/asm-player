import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  // Prevent Vite from clearing console logs in dev
  clearScreen: false,
})