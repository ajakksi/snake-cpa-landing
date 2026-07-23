import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  closeLabel?: string
  className?: string
}

function Modal({
  isOpen,
  onClose,
  children,
  title = 'Dialog',
  closeLabel = 'Close dialog',
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-dark/5 p-4 backdrop-blur-[5px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative my-auto w-full max-w-[37rem] rounded-xl border border-purple bg-white px-4 pb-4 pt-12 shadow-base outline-none md:px-6 md:pb-6 md:pt-10 ${className}`}
      >
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="absolute right-3 top-2 flex size-10 items-center justify-center text-2xl font-bold leading-none text-purple transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple md:right-4 md:top-3"
        >
          X
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
