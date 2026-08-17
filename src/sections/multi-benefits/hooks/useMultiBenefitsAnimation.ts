import { useCallback, type RefObject } from 'react'
import {
  hideBenefitsContent,
  playRevealAnimation,
  clearBenefitsAnimationStyles,
} from '../animations'
import { useBaseAnimation, type BaseAnimationTriggers } from '@hooks/useBaseAnimation'

type MultiBenefitsAnimationRefs = {
  textBlockRef: RefObject<HTMLDivElement | null>
  imageRef: RefObject<HTMLImageElement | null>
  listRef: RefObject<HTMLUListElement | null>
}

export function useMultiBenefitsAnimation(
  refs: MultiBenefitsAnimationRefs,
  triggers: BaseAnimationTriggers,
) {
  const hide = useCallback(() => {
    hideBenefitsContent(refs.textBlockRef.current, refs.imageRef.current, refs.listRef.current)
  }, [refs])

  const play = useCallback(() => {
    return playRevealAnimation(
      refs.textBlockRef.current,
      refs.imageRef.current,
      refs.listRef.current,
    )
  }, [refs])

  const clear = useCallback(() => {
    clearBenefitsAnimationStyles(
      refs.textBlockRef.current,
      refs.imageRef.current,
      refs.listRef.current,
    )
  }, [refs])

  useBaseAnimation(triggers, { hide, play, clear })
}
