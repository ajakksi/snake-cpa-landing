import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'
import { ApiError } from '@api/errors/errors'

vi.mock('@api/endpoints/contact', () => ({
  submitContactForm: vi.fn(),
}))

vi.mock('@api/errors/errors', () => ({
  ApiError: class ApiError extends Error {
    statusCode: number
    isTimeout: boolean
    isNetworkError: boolean

    constructor(message: string, statusCode = 0, isTimeout = false, isNetworkError = false) {
      super(message)
      this.name = 'ApiError'
      this.statusCode = statusCode
      this.isTimeout = isTimeout
      this.isNetworkError = isNetworkError
    }
  },
  // Логика вычисления сообщения об ошибке уже протестирована отдельно
  // (errors.test.ts) — здесь достаточно простого мока, каждый тест
  // сам задаёт нужное возвращаемое значение через mockReturnValueOnce.
  getApiErrorMessage: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'contactForm:mandatoryFields': 'Mandatory fields',
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

import { submitContactForm } from '@api/endpoints/contact'
import { getApiErrorMessage } from '@api/errors/errors'

describe('ContactForm', () => {
  const mockSubmitContactForm = submitContactForm as ReturnType<typeof vi.fn>
  const mockGetApiErrorMessage = getApiErrorMessage as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders form with all input fields', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Contact Method')).toBeInTheDocument()
      expect(screen.getByLabelText('Contact')).toBeInTheDocument()
    })

    it('renders mandatory fields text', () => {
      render(<ContactForm />)
      expect(screen.getByText('Mandatory fields')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<ContactForm />)
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('does not show success message on initial render', () => {
      render(<ContactForm />)
      expect(screen.queryByText('Thank you!')).not.toBeInTheDocument()
    })
  })

  describe('successful form submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'John Doe', method: 'email', contact: 'john@example.com' },
      })

      render(<ContactForm />)

      const contactInput = screen.getByLabelText('Contact')
      const methodSelect = screen.getByLabelText('Contact Method')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      await user.selectOptions(methodSelect, 'email')
      await user.type(contactInput, 'john@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmitContactForm).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'email', contact: 'john@example.com' }),
        )
      })
    })

    it('shows success message after successful submission', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Jane', method: 'telegram', contact: '@jane' },
      })

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'telegram')
      await user.type(screen.getByLabelText('Contact'), '@jane')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
        expect(screen.getByText('We will contact you soon.')).toBeInTheDocument()
      })
    })

    it('hides form after successful submission', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Test', method: 'whatsapp', contact: '+1234567890' },
      })

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'whatsapp')
      await user.type(screen.getByLabelText('Contact'), '+1234567890')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.queryByLabelText('Contact Method')).not.toBeInTheDocument()
      })
    })

    it('renders done button after successful submission', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Test', method: 'email', contact: 'test@example.com' },
      })

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
      })
    })

    it('resets form fields after clicking Done', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Test', method: 'email', contact: 'test@example.com' },
      })

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => screen.getByRole('button', { name: /done/i }))
      await user.click(screen.getByRole('button', { name: /done/i }))

      await waitFor(() => {
        expect(screen.getByLabelText('Contact')).toHaveValue('')
        expect(screen.getByLabelText('Name')).toHaveValue('')
      })
    })
  })

  describe('error handling', () => {
    it('displays error message on API error', async () => {
      const user = userEvent.setup()
      const error = new ApiError('Validation error', 400, false, false)
      mockSubmitContactForm.mockRejectedValueOnce(error)
      mockGetApiErrorMessage.mockReturnValueOnce('Validation error or server error.')

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Validation error or server error.')).toBeInTheDocument()
      })
    })

    it('handles network errors correctly', async () => {
      const user = userEvent.setup()
      const error = new ApiError('Network error', 0, false, true)
      mockSubmitContactForm.mockRejectedValueOnce(error)
      mockGetApiErrorMessage.mockReturnValueOnce('Check your connection.')

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Check your connection.')).toBeInTheDocument()
      })
    })

    it('handles timeout errors correctly', async () => {
      const user = userEvent.setup()
      const error = new ApiError('Request timeout', 0, true, false)
      mockSubmitContactForm.mockRejectedValueOnce(error)
      mockGetApiErrorMessage.mockReturnValueOnce('The request timed out.')

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('The request timed out.')).toBeInTheDocument()
      })
    })

    it('keeps form visible after error', async () => {
      const user = userEvent.setup()
      const error = new ApiError('Server error', 500, false, false)
      mockSubmitContactForm.mockRejectedValueOnce(error)
      mockGetApiErrorMessage.mockReturnValueOnce('Validation error or server error.')

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByLabelText('Contact Method')).toBeInTheDocument()
      })
    })

    it('clears error message when resubmitting', async () => {
      const user = userEvent.setup()
      const error = new ApiError('Error', 400, false, false)
      mockSubmitContactForm.mockRejectedValueOnce(error)
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Test', method: 'email', contact: 'test@example.com' },
      })
      mockGetApiErrorMessage.mockReturnValueOnce('Error message')

      render(<ContactForm />)

      const methodSelect = screen.getByLabelText('Contact Method')
      const contactInput = screen.getByLabelText('Contact')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      await user.selectOptions(methodSelect, 'email')
      await user.type(contactInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })

      await user.clear(contactInput)
      await user.type(contactInput, 'test2@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Error message')).not.toBeInTheDocument()
      })
    })
  })

  describe('callback integration', () => {
    it('calls onDone callback when done button clicked', async () => {
      const user = userEvent.setup()
      const onDone = vi.fn()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: 'Test', method: 'email', contact: 'test@example.com' },
      })

      render(<ContactForm onDone={onDone} />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /done/i }))

      expect(onDone).toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('requires contact method and shows the validation message', async () => {
      const user = userEvent.setup()

      render(<ContactForm />)

      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockSubmitContactForm).not.toHaveBeenCalled()
        expect(screen.getByText('Contact method is required')).toBeInTheDocument()
      })
    })

    it('requires contact field and shows the validation message', async () => {
      const user = userEvent.setup()

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockSubmitContactForm).not.toHaveBeenCalled()
        expect(screen.getByText('Contact information is required')).toBeInTheDocument()
      })
    })

    it('allows submission with empty name', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValueOnce({
        message: 'Success',
        data: { name: undefined, method: 'email', contact: 'test@example.com' },
      })

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockSubmitContactForm).toHaveBeenCalled()
      })
    })
  })

  describe('form interaction', () => {
    it('accepts input for all fields', async () => {
      const user = userEvent.setup()

      render(<ContactForm />)

      const nameInput = screen.getByLabelText('Name')
      const methodSelect = screen.getByLabelText('Contact Method')
      const contactInput = screen.getByLabelText('Contact')

      await user.type(nameInput, 'John Doe')
      await user.selectOptions(methodSelect, 'telegram')
      await user.type(contactInput, '@john')

      expect(nameInput).toHaveValue('John Doe')
      expect(methodSelect).toHaveValue('telegram')
      expect(contactInput).toHaveValue('@john')
    })

    it('handles all contact methods', async () => {
      const user = userEvent.setup()
      mockSubmitContactForm.mockResolvedValue({
        message: 'Success',
        data: { name: '', method: 'email', contact: 'test' },
      })

      const methods = ['telegram', 'whatsapp', 'email']

      for (const method of methods) {
        vi.clearAllMocks()
        const { unmount } = render(<ContactForm />)

        await user.selectOptions(screen.getByLabelText('Contact Method'), method)
        await user.type(screen.getByLabelText('Contact'), 'test')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
          expect(mockSubmitContactForm).toHaveBeenCalledWith(expect.objectContaining({ method }))
        })

        unmount()
      }
    })

    it('disables submit button while submission is in progress', async () => {
      const user = userEvent.setup()
      let resolveSubmit!: (value: unknown) => void
      mockSubmitContactForm.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSubmit = resolve
        }),
      )

      render(<ContactForm />)

      await user.selectOptions(screen.getByLabelText('Contact Method'), 'email')
      await user.type(screen.getByLabelText('Contact'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()

      resolveSubmit({ message: 'Success', data: { method: 'email', contact: 'test@example.com' } })

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })
  })
})
