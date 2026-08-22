import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import ContactForm from './ContactForm'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'contactForm:labels.name': 'Name',
        'contactForm:labels.contactMethod': 'Contact Method',
        'contactForm:labels.yourContact': 'Contact',
        'common:submit': 'Submit',
        'contactForm:successTitle': 'Thank you!',
        'contactForm:successDescription': 'We will contact you soon.',
        'common:done': 'Done',
        'errors.contactMethodRequired': 'Contact method is required',
        'errors.contactRequired': 'Contact information is required',
      }
      return translations[key] || key
    },
  }),
}))

const API_URL = 'http://localhost/api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ContactForm (integration)', () => {
  it('fills the form, submits it, and shows the success state on a real 200 response', async () => {
    const user = userEvent.setup()

    server.use(
      http.post(`${API_URL}/form`, async ({ request }) => {
        const body = await request.json()
        expect(body).toEqual({ name: 'John Doe', method: 'email', contact: 'john@example.com' })

        return HttpResponse.json({
          message: 'Success',
          data: body,
        })
      }),
    )

    render(<ContactForm />)

    await user.type(screen.getByLabelText('Name'), '  John Doe  ')
    await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
    await user.type(screen.getByLabelText('Contact'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument()
    })
  })

  it('shows the real server-mapped message when the API returns a 500', async () => {
    const user = userEvent.setup()

    server.use(
      http.post(`${API_URL}/form`, () =>
        HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
      ),
    )

    render(<ContactForm />)

    await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
    await user.type(screen.getByLabelText('Contact'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Validation error or server error.')).toBeInTheDocument()
    })
  })

  it('never calls the API when contact method is missing (Zod validation blocks submit)', async () => {
    const user = userEvent.setup()

    render(<ContactForm />)

    await user.type(screen.getByLabelText('Contact'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Contact method is required')).toBeInTheDocument()
    })
  })

  it('prevents a second submission while the first is still in flight', async () => {
    const user = userEvent.setup()
    let submitCount = 0

    server.use(
      http.post(`${API_URL}/form`, async () => {
        submitCount += 1
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({
          message: 'Success',
          data: { method: 'email', contact: 'test@example.com' },
        })
      }),
    )

    render(<ContactForm />)

    await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
    await user.type(screen.getByLabelText('Contact'), 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument()
    })

    expect(submitCount).toBe(1)
  })
})
