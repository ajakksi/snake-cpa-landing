import { expect, test } from './fixtures/test'
import { HomePage } from './pages/HomePage'

test.beforeEach(async ({ page }) => {
  await new HomePage(page).goto()
})

test('opens the contact modal and closes it with Escape', async ({ page }) => {
  const home = new HomePage(page)
  const trigger = page.getByRole('button', { name: 'Get in touch' })

  const modal = await home.openContactForm()
  await expect(modal.dialog).toHaveAttribute('open', '')
  await expect(modal.dialog.locator(':focus')).toHaveCount(1)

  await page.keyboard.press('Escape')

  await modal.expectHidden()
  await expect(trigger).toBeFocused()
})

test('closes the contact modal with the close button', async ({ page }) => {
  const modal = await new HomePage(page).openContactForm()

  await modal.closeWithButton()
})

test('closes the contact modal by clicking the backdrop', async ({ page }) => {
  const modal = await new HomePage(page).openContactForm()

  await modal.closeWithBackdrop()
})
