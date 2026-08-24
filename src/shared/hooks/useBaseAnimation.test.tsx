import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useBaseAnimation,
  type BaseAnimationConfig,
  type BaseAnimationTriggers,
} from './useBaseAnimation'
import { onMediaQueryChange } from '@utils/animations'

vi.mock('@utils/animations', () => ({
  onMediaQueryChange: vi.fn(),
}))

const mockOnMediaQueryChange = vi.mocked(onMediaQueryChange)
type Timeline = NonNullable<ReturnType<BaseAnimationConfig['play']>>

const makeAnimations = () => {
  const kill = vi.fn()
  const timeline = { kill } as unknown as Timeline
  return {
    hide: vi.fn(),
    play: vi.fn(() => timeline),
    clear: vi.fn(),
    kill,
  }
}

const baseTriggers = (overrides: Partial<BaseAnimationTriggers> = {}): BaseAnimationTriggers => ({
  playTrigger: 0,
  resetTrigger: 0,
  ...overrides,
})

describe('useBaseAnimation', () => {
  it('should do nothing on initial mount while triggers are still at zero', () => {
    const animations = makeAnimations()
    renderHook(() => useBaseAnimation(baseTriggers(), animations))

    expect(animations.play).not.toHaveBeenCalled()
    expect(animations.hide).not.toHaveBeenCalled()
  })

  it('should play the animation when playTrigger increments', () => {
    const animations = makeAnimations()
    const { rerender } = renderHook(
      ({ triggers }) => useBaseAnimation(triggers, animations),
      { initialProps: { triggers: baseTriggers() } },
    )

    rerender({ triggers: baseTriggers({ playTrigger: 1 }) })

    expect(animations.play).toHaveBeenCalledTimes(1)
  })

  it('should kill the previous timeline and hide when resetTrigger increments', () => {
    const animations = makeAnimations()
    const { rerender } = renderHook(
      ({ triggers }) => useBaseAnimation(triggers, animations),
      { initialProps: { triggers: baseTriggers({ playTrigger: 1 }) } },
    )
    expect(animations.play).toHaveBeenCalledTimes(1)

    rerender({ triggers: baseTriggers({ playTrigger: 1, resetTrigger: 1 }) })

    expect(animations.kill).toHaveBeenCalledTimes(1)
    expect(animations.hide).toHaveBeenCalledTimes(1)
  })

  it('should defer playing while isPending is true, instead of playing immediately', () => {
    const animations = makeAnimations()
    const { rerender } = renderHook(
      ({ triggers }) => useBaseAnimation(triggers, animations),
      { initialProps: { triggers: baseTriggers({ isPending: true }) } },
    )

    rerender({ triggers: baseTriggers({ playTrigger: 1, isPending: true }) })

    expect(animations.play).not.toHaveBeenCalled()
  })

  it('should clear the animation once the media query no longer matches', () => {
    const animations = makeAnimations()
    let capturedCallback: ((matches: boolean) => void) | undefined
    mockOnMediaQueryChange.mockImplementation((cb) => {
      capturedCallback = cb
      return vi.fn()
    })

    const { rerender } = renderHook(
      ({ triggers }) => useBaseAnimation(triggers, animations),
      { initialProps: { triggers: baseTriggers({ playTrigger: 1 }) } },
    )
    expect(animations.play).toHaveBeenCalledTimes(1)

    capturedCallback?.(false)

    expect(animations.kill).toHaveBeenCalledTimes(1)
    expect(animations.clear).toHaveBeenCalledTimes(1)

    rerender({ triggers: baseTriggers({ playTrigger: 1 }) })
  })

  it('should not clear the animation while the media query still matches', () => {
    const animations = makeAnimations()
    let capturedCallback: ((matches: boolean) => void) | undefined
    mockOnMediaQueryChange.mockImplementation((cb) => {
      capturedCallback = cb
      return vi.fn()
    })

    renderHook(() => useBaseAnimation(baseTriggers({ playTrigger: 1 }), animations))

    capturedCallback?.(true)

    expect(animations.clear).not.toHaveBeenCalled()
  })

  it('should unsubscribe from the media query listener on unmount', () => {
    const animations = makeAnimations()
    const unsubscribe = vi.fn()
    mockOnMediaQueryChange.mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => useBaseAnimation(baseTriggers(), animations))
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('BUG: calls play() twice when isPending resolves to false with playTrigger unchanged', () => {
    const animations = makeAnimations()
    const { rerender } = renderHook(
      ({ triggers }) => useBaseAnimation(triggers, animations),
      { initialProps: { triggers: baseTriggers({ playTrigger: 1, isPending: true }) } },
    )
    expect(animations.play).not.toHaveBeenCalled()

    rerender({ triggers: baseTriggers({ playTrigger: 1, isPending: false }) })

    expect(animations.play).toHaveBeenCalledTimes(2)
  })
})