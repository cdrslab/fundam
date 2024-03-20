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
      name: 'FundamHooks',
      fileName: (format) => `fundam-hooks.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router': 'ReactRouter',
          'react-router-dom': 'ReactRouterDOM'
        }
      }
    }
  }
})
