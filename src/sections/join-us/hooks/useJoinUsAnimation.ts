import { useCallback, type RefObject } from 'react'
import {
  hideJoinUsContent,
  playRevealAnimation,
  clearJoinUsAnimationStyles,
} from '../animations'
import { useBaseAnimation, type BaseAnimationTriggers } from '@hooks/useBaseAnimation'

type JoinUsAnimationRefs = {
  tabsRef: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
}

export function useJoinUsAnimation(
  refs: JoinUsAnimationRefs,
  triggers: BaseAnimationTriggers,
) {
  const hide = useCallback(() => {
    hideJoinUsContent(refs.tabsRef.current, refs.panelRef.current)
  }, [refs])

  const play = useCallback(() => {
    return playRevealAnimation(refs.tabsRef.current, refs.panelRef.current)
  }, [refs])

  const clear = useCallback(() => {
    clearJoinUsAnimationStyles(refs.tabsRef.current, refs.panelRef.current)
  }, [refs])

  useBaseAnimation(triggers, { hide, play, clear })
}
