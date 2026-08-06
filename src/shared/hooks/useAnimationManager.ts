import { useCallback, useEffect, useRef, useState } from 'react'

export type SectionTriggers = {
  playTrigger: number
  resetTrigger: number
  exitTrigger?: number
}

export type AnimationState = Record<string, SectionTriggers>

export interface SectionConfig {
  id: string
  hasExitAnimation?: boolean
}

export interface AnimationManagerReturn {
  triggers: AnimationState
  handlePreloaderComplete: () => void
  handleActiveSectionChange: (sectionId: string) => void
  handleSectionTransitionStart: (fromSectionId: string, toSectionId: string) => void
}

export function useAnimationManager(
  sections: SectionConfig[],
  isReady: boolean,
): AnimationManagerReturn {
  const [triggers, setTriggers] = useState<AnimationState>(() => {
    const initial: AnimationState = {}
    sections.forEach((section) => {
      initial[section.id] = {
        playTrigger: 0,
        resetTrigger: 0,
        ...(section.hasExitAnimation && { exitTrigger: 0 }),
      }
    })
    return initial
  })

  const hasPreloaderCompletedRef = useRef(false)
  const previousActiveSectionRef = useRef<string | null>(null)
  const latestActiveSectionRef = useRef<string>(sections[0]?.id || 'hero')
  const previousIsReadyRef = useRef(isReady)

  const playAnimation = useCallback((sectionId: string) => {
    setTriggers((prev) => {
      if (!prev[sectionId]) return prev
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          playTrigger: prev[sectionId].playTrigger + 1,
        },
      }
    })
  }, [])

  const resetAnimation = useCallback((sectionId: string) => {
    setTriggers((prev) => {
      if (!prev[sectionId]) return prev
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          resetTrigger: prev[sectionId].resetTrigger + 1,
        },
      }
    })
  }, [])

  const playExitAnimation = useCallback((sectionId: string) => {
    setTriggers((prev) => {
      if (prev[sectionId]?.exitTrigger === undefined) return prev
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          exitTrigger: (prev[sectionId].exitTrigger ?? 0) + 1,
        },
      }
    })
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    hasPreloaderCompletedRef.current = true
    playAnimation(latestActiveSectionRef.current)
  }, [playAnimation])

  useEffect(() => {
    if (previousIsReadyRef.current && !isReady && !document.hidden) {
      hasPreloaderCompletedRef.current = false
      resetAnimation(latestActiveSectionRef.current)
    }
    previousIsReadyRef.current = isReady
  }, [isReady, resetAnimation])

  const handleActiveSectionChange = useCallback(
    (sectionId: string) => {
      latestActiveSectionRef.current = sectionId

      if (hasPreloaderCompletedRef.current) {
        playAnimation(sectionId)
      }

      if (previousActiveSectionRef.current && previousActiveSectionRef.current !== sectionId) {
        resetAnimation(previousActiveSectionRef.current)
      }

      previousActiveSectionRef.current = sectionId
    },
    [playAnimation, resetAnimation],
  )

  const handleSectionTransitionStart = useCallback(
    (fromSectionId: string) => {
      if (fromSectionId) {
        playExitAnimation(fromSectionId)
      }
    },
    [playExitAnimation],
  )

  return {
    triggers,
    handlePreloaderComplete,
    handleActiveSectionChange,
    handleSectionTransitionStart,
  }
}
