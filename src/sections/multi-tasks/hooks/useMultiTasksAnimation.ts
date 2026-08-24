import { useCallback, type RefObject } from 'react'
import {
  hideColumns,
  playRevealAnimation,
  clearMultiTasksAnimationStyles,
} from '../animations'
import { useBaseAnimation, type BaseAnimationTriggers } from '@hooks/useBaseAnimation'

type MultiTasksAnimationRefs = {
  col1Ref: RefObject<HTMLDivElement | null>
  col2Ref: RefObject<HTMLDivElement | null>
  col3Ref: RefObject<HTMLDivElement | null>
}

export function useMultiTasksAnimation(
  refs: MultiTasksAnimationRefs,
  triggers: BaseAnimationTriggers,
) {
  const hide = useCallback(() => {
    hideColumns(refs.col1Ref.current, refs.col2Ref.current, refs.col3Ref.current)
  }, [refs])

  const play = useCallback(() => {
    return playRevealAnimation(
      refs.col1Ref.current,
      refs.col2Ref.current,
      refs.col3Ref.current,
    )
  }, [refs])

  const clear = useCallback(() => {
    clearMultiTasksAnimationStyles(
      refs.col1Ref.current,
      refs.col2Ref.current,
      refs.col3Ref.current,
    )
  }, [refs])

  useBaseAnimation(triggers, { hide, play, clear })
}
