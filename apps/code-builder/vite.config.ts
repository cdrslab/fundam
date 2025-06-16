import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fundam/antd': path.resolve(__dirname,  '../../packages/antd/index.ts'),
      '@fundam/utils': path.resolve(__dirname,  '../../packages/utils/index.ts'),
      '@fundam/hooks': path.resolve(__dirname,  '../../packages/hooks/index.ts'),
    }
  },
  server: {
    port: 5806,
    host: true
  },
  optimizeDeps: {
    exclude: ['@fundam/antd', '@fundam/utils', '@fundam/hooks']
  }
})
