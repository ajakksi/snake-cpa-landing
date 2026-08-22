import { expect, test } from './fixtures/test'
import { apiResponses, type ApiLocale } from './mocks/apiResponses'
import { HomePage } from './pages/HomePage'

for (const { path, locale } of [
  { path: '/', locale: 'en' },
  { path: '/ru', locale: 'ru' },
  { path: '/ua', locale: 'ua' },
]) {
  test(`loads the ${locale} landing page with mocked API content`, async ({ page }) => {
    const response = apiResponses[locale as ApiLocale]
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    const home = new HomePage(page)
    await home.goto(path)

    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Practice')
    await expect(page.getByText(response.tasks.description)).toBeAttached()
    await expect(page.getByText(response.benefits.title)).toBeAttached()
    await expect(page.getByText(response.multiply[0].steps.step_1)).toBeAttached()
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
}
