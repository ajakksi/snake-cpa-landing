import { defineConfig, mergeConfig } from 'vitest/config'
import vitestConfig from './vitest.config'

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      exclude: ['src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
    },
  }),
)
