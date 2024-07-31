/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path'

// @ts-ignore
import { vitePluginFakeServer } from 'vite-plugin-fake-server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginFakeServer()
  ],
  resolve: {
    alias: {
      '@fundam/antd': path.resolve(__dirname,  '../../packages/antd/index.ts'),
      '@fundam/utils': path.resolve(__dirname,  '../../packages/utils/index.ts'),
      '@fundam/hooks': path.resolve(__dirname,  '../../packages/hooks/index.ts'),
    }
  }
});
