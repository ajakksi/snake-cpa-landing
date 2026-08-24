import { expect, test } from './fixtures/test'
import { HomePage } from './pages/HomePage'

test('navigates to a landing section from the desktop header', async ({ page }) => {
  await new HomePage(page).goto()

  await page.getByRole('link', { name: 'Team', exact: true }).click()

  await expect(page).toHaveURL(/#team$/)
  await expect
    .poll(() => page.locator('#team').evaluate((element) => element.getBoundingClientRect().top))
    .toBe(0)
})

test('opens and closes the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await new HomePage(page).goto()

  await page.getByRole('button', { name: 'MENU' }).click()
  await expect(page.getByRole('link', { name: 'Main', exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Team', exact: true }).click()
  await expect(page).toHaveURL(/#team$/)
  await expect(page.getByRole('link', { name: 'Main', exact: true })).toBeHidden()

  await page.getByRole('button', { name: 'MENU' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('link', { name: 'Main', exact: true })).toBeHidden()
})
