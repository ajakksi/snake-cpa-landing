import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimationManager, type SectionConfig } from './useAnimationManager'

const sections: SectionConfig[] = [
  { id: 'hero' },
  { id: 'benefits', hasExitAnimation: true },
  { id: 'tasks' },
]

describe('useAnimationManager', () => {
  it('should initialize every section with zeroed triggers, adding exitTrigger only where configured', () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    expect(result.current.triggers).toEqual({
      hero: { playTrigger: 0, resetTrigger: 0 },
      benefits: { playTrigger: 0, resetTrigger: 0, exitTrigger: 0 },
      tasks: { playTrigger: 0, resetTrigger: 0 },
    })
  })

  it("should play the currently active section's animation when the preloader completes", () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    act(() => {
      result.current.handleActiveSectionChange('benefits')
    })
    act(() => {
      result.current.handlePreloaderComplete()
    })

    expect(result.current.triggers.benefits.playTrigger).toBe(1)
    expect(result.current.triggers.hero.playTrigger).toBe(0)
  })

  it("should not play a section's animation on activation before the preloader has completed", () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    act(() => {
      result.current.handleActiveSectionChange('benefits')
    })

    expect(result.current.triggers.benefits.playTrigger).toBe(0)
  })

  it('should play the new section and reset the previous one once the preloader has completed', () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    act(() => {
      result.current.handleActiveSectionChange('hero')
      result.current.handlePreloaderComplete()
    })
    act(() => {
      result.current.handleActiveSectionChange('benefits')
    })

    expect(result.current.triggers.benefits.playTrigger).toBe(1)
    expect(result.current.triggers.hero.resetTrigger).toBe(1)
  })

  it('should play the exit animation for the section being transitioned away from', () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    act(() => {
      result.current.handleSectionTransitionStart('benefits', 'tasks')
    })

    expect(result.current.triggers.benefits.exitTrigger).toBe(1)
  })

  it('should not touch exitTrigger for a section that was not configured to have one', () => {
    const { result } = renderHook(() => useAnimationManager(sections, false))

    act(() => {
      result.current.handleSectionTransitionStart('hero', 'benefits')
    })

    expect(result.current.triggers.hero).not.toHaveProperty('exitTrigger')
  })

  it('should reset the active section and require a fresh preloader completion if isReady drops back to false', () => {
    const { result, rerender } = renderHook(
      ({ isReady }) => useAnimationManager(sections, isReady),
      { initialProps: { isReady: true } },
    )

    act(() => {
      result.current.handleActiveSectionChange('hero')
      result.current.handlePreloaderComplete()
    })
    expect(result.current.triggers.hero.playTrigger).toBe(1)

    rerender({ isReady: false })
    expect(result.current.triggers.hero.resetTrigger).toBe(1)

    // Preloader hasn't re-completed yet, so a section change shouldn't play again.
    act(() => {
      result.current.handleActiveSectionChange('benefits')
    })
    expect(result.current.triggers.benefits.playTrigger).toBe(0)
  })
})