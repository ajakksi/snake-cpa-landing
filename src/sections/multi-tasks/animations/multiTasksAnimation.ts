import gsap from 'gsap'
import { TASKS, EASE } from '@constants/animations'
import { filterElements, hideElements, clearAnimationStyles, isDesktopView, hasAllElements } from '@utils/animations'

export const COL1_DURATION = TASKS.COL1_DURATION
export const COL2_DURATION = TASKS.COL2_DURATION
export const COL3_DURATION = TASKS.COL3_DURATION
export const COL_GAP = TASKS.COL_GAP
export const COL1_OFFSET_X = TASKS.COL1_OFFSET_X
export const COL_RIGHT_OFFSET_X = TASKS.COL_RIGHT_OFFSET_X

export function hideColumns(
  col1Ref: HTMLDivElement | null,
  col2Ref: HTMLDivElement | null,
  col3Ref: HTMLDivElement | null,
) {
  if (!isDesktopView()) return
  hideElements(filterElements(col1Ref), { offsetX: -COL1_OFFSET_X })
  hideElements(filterElements(col2Ref, col3Ref), { offsetX: COL_RIGHT_OFFSET_X })
}

export function playRevealAnimation(
  col1Ref: HTMLDivElement | null,
  col2Ref: HTMLDivElement | null,
  col3Ref: HTMLDivElement | null,
): gsap.core.Timeline | null {
  if (!isDesktopView()) return null
  if (!hasAllElements(col1Ref, col2Ref, col3Ref)) return null

  const tl = gsap.timeline()

  tl.fromTo(
    filterElements(col1Ref),
    { opacity: 0, x: -COL1_OFFSET_X },
    { opacity: 1, x: 0, duration: COL1_DURATION, ease: EASE.REVEAL },
    0,
  ).fromTo(
    filterElements(col2Ref),
    { opacity: 0, x: COL_RIGHT_OFFSET_X },
    { opacity: 1, x: 0, duration: COL2_DURATION, ease: EASE.REVEAL },
    COL_GAP,
  ).fromTo(
    filterElements(col3Ref),
    { opacity: 0, x: COL_RIGHT_OFFSET_X },
    { opacity: 1, x: 0, duration: COL3_DURATION, ease: EASE.REVEAL },
    COL_GAP + COL2_DURATION,
  )

  return tl
}

export function clearMultiTasksAnimationStyles(
  col1Ref: HTMLDivElement | null,
  col2Ref: HTMLDivElement | null,
  col3Ref: HTMLDivElement | null,
) {
  clearAnimationStyles(col1Ref, col2Ref, col3Ref)
}
