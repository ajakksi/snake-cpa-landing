import { expect, test } from './fixtures/test'
import { HomePage } from './pages/HomePage'

for (const { path, locale, cta } of [
  { path: '/', locale: 'en', cta: 'Get in touch' },
  { path: '/ru', locale: 'ru', cta: 'Получить профит' },
  { path: '/ua', locale: 'ua', cta: "Зв'язатися з нами" },
]) {
  test(`loads the ${locale} locale`, async ({ page }) => {
    await new HomePage(page).goto(path)

    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Practice')
    await expect(page.getByRole('button', { name: cta })).toBeVisible()
  })
}

test('shows the not found page for an unsupported locale', async ({ page }) => {
  await page.goto('/de')

  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/404/)
  await expect(page).toHaveURL(/\/de$/)
})
