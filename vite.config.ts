import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolvePath('./src/shared/components'),
      '@hooks': resolvePath('./src/shared/hooks'),
      '@utils': resolvePath('./src/shared/utils'),
      '@api': resolvePath('./src/shared/api'),
      '@types': resolvePath('./src/shared/types'),
      '@validation': resolvePath('./src/shared/validation'),
      '@constants': resolvePath('./src/shared/constants'),
      '@i18n': resolvePath('./src/shared/i18n'),
      '@sections': resolvePath('./src/sections'),
      '@assets': resolvePath('./src/assets'),
      '@app': resolvePath('./src/app'),
    },
  },
})
