import { useEffect, useRef } from 'react'
import { onMediaQueryChange } from '@utils/animations'

export interface BaseAnimationConfig {
  hide: () => void
  play: () => gsap.core.Timeline | null
  clear: () => void
}

export interface BaseAnimationTriggers {
  playTrigger: number
  resetTrigger: number
  isPending?: boolean
}

export function useBaseAnimation(
  triggers: BaseAnimationTriggers,
  animations: BaseAnimationConfig,
): void {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const pendingPlayRef = useRef(false)
  const animationsRef = useRef(animations)

  useEffect(() => {
    animationsRef.current = animations
  }, [animations])

  useEffect(() => {
    if (triggers.resetTrigger === 0) return
    timelineRef.current?.kill()
    animationsRef.current.hide()
  }, [triggers.resetTrigger])

  useEffect(() => {
    if (triggers.playTrigger === 0) return

    if (triggers.isPending) {
      pendingPlayRef.current = true
      return
    }

    timelineRef.current?.kill()
    timelineRef.current = animationsRef.current.play()
  }, [triggers.playTrigger, triggers.isPending])

  useEffect(() => {
    if (!pendingPlayRef.current || triggers.isPending) return
    pendingPlayRef.current = false
    timelineRef.current?.kill()
    timelineRef.current = animationsRef.current.play()
  }, [triggers.isPending])

  useEffect(() => {
    return onMediaQueryChange((matches) => {
      if (!matches) {
        timelineRef.current?.kill()
        animationsRef.current.clear()
      }
    })
  }, [])
}
