import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 允许在.less文件中使用JavaScript
      }
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'FundamAntd',
      fileName: (format) => `fundam-antd.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router', 'react-router-dom', 'antd', '@ant-design/icons', 'dayjs'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router': 'ReactRouter',
          'react-router-dom': 'ReactRouterDOM',
          'antd': 'Antd',
          '@ant-design/icons': 'AntDesignIcons',
          'dayjs': 'Dayjs'
        }
      }
    }
  }
})
