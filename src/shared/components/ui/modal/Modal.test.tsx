import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('should keep the native dialog closed and omit its content when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal content
      </Modal>,
    )

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should render children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>,
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should open the native dialog when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInstanceOf(HTMLDialogElement)
    expect(screen.getByRole('dialog')).toHaveAttribute('open')
  })

  it('should set aria-label from the title prop', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Custom Title">
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Custom Title' })).toBeInTheDocument()
  })

  it('should close the native dialog when isOpen becomes false', () => {
    const handleClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose}>
        Content
      </Modal>,
    )

    rerender(
      <Modal isOpen={false} onClose={handleClose}>
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should not call onClose when clicking inside the modal', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="modal-content">Clickable content</div>
      </Modal>,
    )

    await user.click(screen.getByTestId('modal-content'))
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should render the close button with the given accessible label', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} closeLabel="Close this dialog">
        Content
      </Modal>,
    )

    expect(screen.getByRole('button', { name: 'Close this dialog' })).toBeInTheDocument()
  })

  it('should apply a custom className to the modal panel', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-class">
        Content
      </Modal>,
    )

    expect(document.body.querySelector('.custom-class')).toBeInTheDocument()
  })
})
