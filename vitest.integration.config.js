import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
    },
  }),
)
