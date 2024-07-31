import { defineConfig } from 'dumi';
import path from 'path'

export default defineConfig({
  themeConfig: {
    name: 'Fundam',
  },
  alias: {
    '@fundam/antd': path.resolve(__dirname,  '../../packages/antd/index.ts'),
    '@fundam/utils': path.resolve(__dirname,  '../../packages/utils/index.ts'),
  }
})
