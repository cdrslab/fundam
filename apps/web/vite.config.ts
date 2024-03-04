/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { vitePluginFakeServer } from 'vite-plugin-fake-server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginFakeServer()
  ]
});
