import { expect, test } from './fixtures/test'
import { HomePage } from './pages/HomePage'

test('shows validation errors for an empty form', async ({ page }) => {
  const home = new HomePage(page)
  await home.goto()
  const modal = await home.openContactForm()

  await modal.submitEmpty()

  await expect(modal.dialog.getByText('Please choose a contact method')).toBeVisible()
  await expect(modal.dialog.getByText('Please enter your contact details')).toBeVisible()
})

test('submits the contact form', async ({ page }) => {
  let submittedBody: unknown
  await page.route(/\/form(?:\?.*)?$/, async (route) => {
    submittedBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Application received', data: submittedBody }),
    })
  })

  const home = new HomePage(page)
  await home.goto()
  const modal = await home.openContactForm()

  await modal.fillAndSubmit({
    name: 'E2E User',
    method: 'email',
    contact: 'e2e@example.com',
  })

  await expect(
    modal.dialog.getByRole('heading', { name: 'We have received your application!' }),
  ).toBeVisible()
  expect(submittedBody).toEqual({ name: 'E2E User', method: 'email', contact: 'e2e@example.com' })

  await modal.dialog.getByRole('button', { name: 'Done' }).click()
  await modal.expectHidden()
})

test('shows an API error when form submission fails', async ({ page }) => {
  await page.route(/\/form(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Server error' }),
    }),
  )

  const home = new HomePage(page)
  await home.goto()
  const modal = await home.openContactForm()

  await modal.fillAndSubmit({ method: 'email', contact: 'e2e@example.com' })

  await expect(modal.dialog.getByText('Validation error or server error.')).toBeVisible()
  await modal.expectVisible()
})
