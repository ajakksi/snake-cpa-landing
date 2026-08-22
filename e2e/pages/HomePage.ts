import { expect, type Page } from '@playwright/test'
import { ContactModal } from './ContactModal'

export class HomePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path)
    await expect(this.page.getByRole('status', { name: 'Loading content' })).toBeHidden({
      timeout: 10_000,
    })
  }

  async openContactForm(): Promise<ContactModal> {
    await this.page.getByRole('button', { name: 'Get in touch' }).click()
    const modal = new ContactModal(this.page)
    await modal.expectVisible()
    return modal
  }
}
