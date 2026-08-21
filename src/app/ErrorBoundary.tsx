import { Component, type ErrorInfo, type ReactNode } from 'react'
import { PageBackground } from '@components/layout'
import { Button } from '@components/ui'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled React error', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <>
        <PageBackground />
        <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 text-center text-white">
          <div className="flex max-w-xl flex-col items-center">
            <h1 className="text-[38px] font-bold uppercase leading-none md:text-[64px]">
              Something went wrong
            </h1>
            <p className="mt-5 text-[18px] leading-tight md:text-[20px]">
              Please try again or return to the home page.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button type="button" onClick={() => window.location.reload()}>
                Try again
              </Button>
              <a
                href="/"
                className="inline-flex min-h-[2.2rem] items-center justify-center rounded-[0.45rem] bg-yellow px-[1.25rem] py-[0.55rem] text-[0.75rem] font-bold leading-none text-ink transition-colors hover:bg-purple hover:text-white"
              >
                Home
              </a>
            </div>
          </div>
        </main>
      </>
    )
  }
}

export default ErrorBoundary
