import { expect, test } from './fixtures/test'
import { tasksResponse } from './mocks/apiResponses'
import { HomePage } from './pages/HomePage'

test('shows an error when landing content cannot be loaded', async ({ page }) => {
  await page.route(/\/en\/tasks(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Forbidden' }),
    }),
  )

  await new HomePage(page).goto()

  await expect(page.getByText('Forbidden. Invalid or missing API Key.')).toBeAttached()
})

test('recovers after retrying a failed content request', async ({ page }) => {
  let shouldFail = true
  await page.route(/\/en\/tasks(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: shouldFail ? 500 : 200,
      contentType: 'application/json',
      body: JSON.stringify(shouldFail ? { message: 'Server error' } : tasksResponse),
    }),
  )

  await new HomePage(page).goto()
  await page.getByRole('link', { name: 'Team', exact: true }).click()
  await expect(page).toHaveURL(/#team$/)
  await expect(page.getByText('Validation error or server error.')).toBeAttached({
    timeout: 15_000,
  })

  shouldFail = false
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect(page.getByText(tasksResponse.description)).toBeAttached()
  await expect(page.getByText('Validation error or server error.')).toBeHidden()
})
