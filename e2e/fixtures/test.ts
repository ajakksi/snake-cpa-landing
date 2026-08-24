import { test as base, expect } from '@playwright/test'
import { mockApi } from '../mocks/api'

export const test = base.extend({
  page: async ({ page }, providePage) => {
    await mockApi(page)
    await providePage(page)
  },
})

export { expect }
