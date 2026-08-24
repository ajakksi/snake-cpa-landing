import { expect, test } from './fixtures/test'
import { HomePage } from './pages/HomePage'

test('matches the desktop hero snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await new HomePage(page).goto()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1')

  await expect(page).toHaveScreenshot('hero-desktop.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  })
})

test('matches the mobile hero snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await new HomePage(page).goto()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1')

  await expect(page).toHaveScreenshot('hero-mobile.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  })
})
