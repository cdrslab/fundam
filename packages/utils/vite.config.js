import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'FundamUtils',
      fileName: (format) => `fundam-utils.${format}.js`
    }
  }
})
