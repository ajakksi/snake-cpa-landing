import type { Page, Route } from '@playwright/test'
import { benefitsResponse, contactResponse, multiplyResponse, tasksResponse } from './apiResponses'

const fulfillJson = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

export async function mockApi(page: Page) {
  await page.route(/\/(en|ru|ua)\/tasks(?:\?.*)?$/, (route) => fulfillJson(route, tasksResponse))
  await page.route(/\/(en|ru|ua)\/benefits(?:\?.*)?$/, (route) =>
    fulfillJson(route, benefitsResponse),
  )
  await page.route(/\/(en|ru|ua)\/multiply(?:\?.*)?$/, (route) =>
    fulfillJson(route, multiplyResponse),
  )
  await page.route(/\/form(?:\?.*)?$/, (route) => fulfillJson(route, contactResponse))
}
