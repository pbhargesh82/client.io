import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@clientspace/shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: [
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@base-ui/react/button',
      '@base-ui/react/avatar',
      '@base-ui/react/separator',
      '@base-ui/react/input',
      '@base-ui/react/dialog',
      '@base-ui/react/select',
      '@base-ui/react/tabs',
    ],
  },
})
