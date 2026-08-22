import { expect, test } from './fixtures/test'

test('loads the landing page with mocked API content', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('status', { name: 'Loading content' })).toBeHidden({
    timeout: 10_000,
  })
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Practice')
  await expect(page.getByText('We solve performance marketing challenges.')).toBeAttached()
})
