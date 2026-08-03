import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      '@pages': resolvePath('./src/pages'),
      '@components': resolvePath('./src/shared/components'),
      '@hooks': resolvePath('./src/shared/hooks'),
      '@utils': resolvePath('./src/shared/utils'),
      '@api': resolvePath('./src/shared/api'),
      '@app-types': resolvePath('./src/shared/types'),
      '@validation': resolvePath('./src/shared/validation'),
      '@constants': resolvePath('./src/shared/constants'),
      '@data': resolvePath('./src/shared/data'),
      '@i18n': resolvePath('./src/shared/i18n'),
      '@sections': resolvePath('./src/sections'),
      '@assets': resolvePath('./src/assets'),
      '@app': resolvePath('./src/app'),
    },
  },
})
