import gsap from 'gsap'
import { BENEFITS, EASE } from '@constants/animations'
import { filterElements, hideElements, clearAnimationStyles, isDesktopView, hasAllElements } from '@utils/animations'

export const REVEAL_DURATION = BENEFITS.REVEAL_DURATION
export const TEXT_OFFSET_X = BENEFITS.TEXT_OFFSET_X
export const RIGHT_OFFSET_X = BENEFITS.RIGHT_OFFSET_X

export function hideBenefitsContent(
  textBlockRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
  listRef: HTMLUListElement | null,
) {
  if (!isDesktopView()) return
  hideElements(filterElements(textBlockRef), { offsetX: -TEXT_OFFSET_X })
  hideElements(filterElements(imageRef, listRef), { offsetX: RIGHT_OFFSET_X })
}

export function playRevealAnimation(
  textBlockRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
  listRef: HTMLUListElement | null,
): gsap.core.Timeline | null {
  if (!isDesktopView()) return null
  if (!hasAllElements(textBlockRef, imageRef, listRef)) return null

  const tl = gsap.timeline()

  tl.fromTo(
    filterElements(textBlockRef),
    { opacity: 0, x: -TEXT_OFFSET_X },
    { opacity: 1, x: 0, duration: REVEAL_DURATION, ease: EASE.REVEAL },
    0,
  ).fromTo(
    filterElements(imageRef, listRef),
    { opacity: 0, x: RIGHT_OFFSET_X },
    { opacity: 1, x: 0, duration: REVEAL_DURATION, ease: EASE.REVEAL },
    0,
  )

  return tl
}

export function clearBenefitsAnimationStyles(
  textBlockRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
  listRef: HTMLUListElement | null,
) {
  clearAnimationStyles(textBlockRef, imageRef, listRef)
}
