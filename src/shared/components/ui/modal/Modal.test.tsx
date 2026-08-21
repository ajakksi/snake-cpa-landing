import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal content
      </Modal>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>,
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should render as a dialog with aria-modal attribute', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('should set aria-label from the title prop', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Custom Title">
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Custom Title' })).toBeInTheDocument()
  })

  it('should call onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={handleClose}>
        Content
      </Modal>,
    )

    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose on Escape once the modal has closed (listener is cleaned up)', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

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

    await user.keyboard('{Escape}')
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should call onClose when clicking the backdrop, outside the modal', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="modal-content">Content</div>
      </Modal>,
    )

    // Modal renders via createPortal into document.body, so it lives outside
    // the RTL `container` — query document.body directly (or use `screen`,
    // which does the same) rather than `container.querySelector`.
    const backdrop = document.body.querySelector('[role="presentation"]')
    expect(backdrop).toBeInTheDocument()

    await user.click(backdrop as Element)
    expect(handleClose).toHaveBeenCalledTimes(1)
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

  it('should render the close button with the given label and call onClose when clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={handleClose} closeLabel="Close this dialog">
        Content
      </Modal>,
    )

    const closeButton = screen.getByRole('button', { name: 'Close this dialog' })
    await user.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should accept a custom className on the dialog', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-class">
        Content
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveClass('custom-class')
  })
})
