import { useCallback, useEffect, useRef, type RefObject } from 'react'
import {
  DESKTOP_QUERY,
  resetHeroAnimation,
  playRevealAnimation,
  playExitAnimation,
  clearHeroAnimationStyles,
} from '../animations'
import { useBaseAnimation, type BaseAnimationTriggers } from '@hooks/useBaseAnimation'

type HeroAnimationRefs = {
  titleRef: RefObject<HTMLHeadingElement | null>
  descriptionRef: RefObject<HTMLParagraphElement | null>
  ctaRef: RefObject<HTMLDivElement | null>
  imageRef: RefObject<HTMLImageElement | null>
}

type HeroAnimationTriggers = BaseAnimationTriggers & {
  exitTrigger: number
}

export function useHeroAnimation(
  refs: HeroAnimationRefs,
  triggers: HeroAnimationTriggers,
) {
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const hide = useCallback(() => {
    resetHeroAnimation(
      refs.titleRef.current,
      refs.descriptionRef.current,
      refs.ctaRef.current,
      refs.imageRef.current,
    )
  }, [])

  const play = useCallback(() => {
    return playRevealAnimation(
      refs.titleRef.current,
      refs.descriptionRef.current,
      refs.ctaRef.current,
    )
  }, [])

  const clear = useCallback(() => {
    clearHeroAnimationStyles(
      refs.titleRef.current,
      refs.descriptionRef.current,
      refs.ctaRef.current,
      refs.imageRef.current,
    )
  }, [])

  useBaseAnimation(triggers, { hide, play, clear })

  useEffect(() => {
    if (triggers.exitTrigger === 0) return
    if (!window.matchMedia(DESKTOP_QUERY).matches) return

    if (!refs.titleRef.current || !refs.descriptionRef.current || !refs.ctaRef.current) return

    exitTimelineRef.current?.kill()
    exitTimelineRef.current = playExitAnimation(
      refs.titleRef.current,
      refs.descriptionRef.current,
      refs.ctaRef.current,
      refs.imageRef.current,
    )
  }, [triggers.exitTrigger])
}
