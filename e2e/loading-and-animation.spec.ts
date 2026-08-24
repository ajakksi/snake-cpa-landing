import { expect, test } from './fixtures/test'
import { benefitsResponse, multiplyResponse, tasksResponse } from './mocks/apiResponses'
import { HomePage } from './pages/HomePage'

test('keeps the preloader open until every API response is received', async ({ page }) => {
  let releaseMultiply: (() => void) | undefined
  const multiplyReleased = new Promise<void>((resolve) => {
    releaseMultiply = resolve
  })

  await page.route(/\/en\/multiply(?:\?.*)?$/, async (route) => {
    await multiplyReleased
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          title: 'For Media Buyers',
          steps: { step_1: 'First step', step_2: 'Second step' },
        },
      ]),
    })
  })

  await page.goto('/')
  await expect(page.getByRole('status', { name: 'Loading content' })).toBeVisible()
  await page.waitForTimeout(3_000)
  await expect(page.getByRole('status', { name: 'Loading content' })).toBeVisible()

  releaseMultiply?.()
  await expect(page.getByRole('status', { name: 'Loading content' })).toBeHidden({
    timeout: 10_000,
  })
})

for (const { path, locale } of [
  { path: '/', locale: 'en' },
  { path: '/ru', locale: 'ru' },
  { path: '/ua', locale: 'ua' },
]) {
  test(`requests ${locale} API content with the API key`, async ({ page }) => {
    const requests = new Map<string, string | undefined>()
    page.on('request', (request) => {
      const match = request.url().match(new RegExp(`/${locale}/(tasks|benefits|multiply)$`))
      if (match) requests.set(match[1], request.headers()['x-api-key'])
    })

    await new HomePage(page).goto(path)

    expect([...requests.keys()].sort()).toEqual(['benefits', 'multiply', 'tasks'])
    requests.forEach((apiKey) => expect(apiKey).toBe('test-key'))
  })
}

test('finishes desktop reveal animations without leaving content hidden', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await new HomePage(page).goto()

  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveCSS('opacity', '1')
  await expect(heading).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})

for (const { linkName, sectionId, content } of [
  {
    linkName: 'Team',
    sectionId: 'team',
    content: tasksResponse.description,
  },
  { linkName: 'Benefits', sectionId: 'benefits', content: benefitsResponse.title },
  { linkName: 'Join us', sectionId: 'join-us', content: multiplyResponse[0].steps.step_1 },
]) {
  test(`reveals the ${sectionId} section after desktop navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await new HomePage(page).goto()

    await page.getByRole('link', { name: linkName, exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`#${sectionId}$`))
    await expect
      .poll(() =>
        page
          .locator(`#${sectionId}`)
          .evaluate((section) => Math.round(section.getBoundingClientRect().top)),
      )
      .toBe(0)

    const contentLocator = page.getByText(content, { exact: true })
    await expect
      .poll(() =>
        contentLocator.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          let current: Element | null = element

          while (current) {
            if (Number.parseFloat(getComputedStyle(current).opacity) < 0.99) return false
            current = current.parentElement
          }

          return rect.bottom > 0 && rect.top < window.innerHeight
        }),
      )
      .toBe(true)
  })
}

test('does not apply reveal animation styles on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await new HomePage(page).goto()

  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveCSS('opacity', '1')
  await expect(heading).toHaveCSS('transform', /none|matrix\(1, 0, 0, 1, 0, 0\)/)
})

test.describe('touchscreen', () => {
  test.use({ viewport: { width: 1280, height: 800 }, hasTouch: true })

  test('does not apply reveal animation styles on a wide touch device', async ({ page }) => {
    await new HomePage(page).goto()

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveCSS('opacity', '1')
    await expect(heading).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })
})
