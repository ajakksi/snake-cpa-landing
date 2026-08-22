import { expect, type Locator, type Page } from '@playwright/test'

export class ContactModal {
  readonly page: Page
  readonly dialog: Locator
  readonly backdrop: Locator
  readonly closeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.dialog = page.getByRole('dialog', { name: 'Join us' })
    this.backdrop = this.dialog.locator('[role="presentation"]')
    this.closeButton = this.dialog.getByRole('button', { name: 'Close dialog' })
  }

  async expectVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible()
  }

  async expectHidden(): Promise<void> {
    await expect(this.dialog).toBeHidden()
  }

  async closeWithButton(): Promise<void> {
    await this.closeButton.click()
    await this.expectHidden()
  }

  async closeWithBackdrop(): Promise<void> {
    await this.backdrop.click({ position: { x: 2, y: 2 } })
    await this.expectHidden()
  }

  async submitEmpty(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Submit' }).click()
  }

  async fillAndSubmit({
    name,
    method,
    contact,
  }: {
    name?: string
    method: 'telegram' | 'whatsapp' | 'email'
    contact: string
  }): Promise<void> {
    if (name) await this.dialog.getByLabel('Your Name').fill(name)
    await this.dialog.getByLabel('Contact Method').selectOption(method)
    await this.dialog.getByLabel('Your Contact').fill(contact)
    await this.dialog.getByRole('button', { name: 'Submit' }).click()
  }
}
