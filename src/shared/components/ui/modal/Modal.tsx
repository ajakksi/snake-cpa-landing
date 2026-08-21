import { useEffect, useRef, type ReactNode } from 'react'
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [isOpen])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={title}
      className="m-0 h-full max-h-none w-full max-w-none overflow-y-auto border-0 bg-transparent p-0 text-inherit backdrop:bg-dark/5 backdrop:backdrop-blur-[5px]"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {isOpen ? (
        <div
          role="presentation"
          className="flex min-h-full items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <div
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
        </div>
      ) : null}
    </dialog>,
    document.body,
  )
}

export default Modal
