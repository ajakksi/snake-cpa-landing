import type { Page, Route } from '@playwright/test'
import { apiResponses, contactResponse, type ApiLocale } from './apiResponses'

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

export async function mockApi(page: Page) {
  const localizedResponse = (route: Route, resource: 'tasks' | 'benefits' | 'multiply') => {
    const locale = route
      .request()
      .url()
      .match(/\/(en|ru|ua)\//)?.[1] as ApiLocale
    return fulfillJson(route, apiResponses[locale][resource])
  }

  await page.route(/\/(en|ru|ua)\/tasks(?:\?.*)?$/, (route) => localizedResponse(route, 'tasks'))
  await page.route(/\/(en|ru|ua)\/benefits(?:\?.*)?$/, (route) =>
    localizedResponse(route, 'benefits'),
  )
  await page.route(/\/(en|ru|ua)\/multiply(?:\?.*)?$/, (route) =>
    localizedResponse(route, 'multiply'),
  )
  await page.route(/\/form(?:\?.*)?$/, (route) => fulfillJson(route, contactResponse))
}
