import gsap from 'gsap'
import { HERO, EASE } from '@constants/animations'
import { filterElements, hideElements, clearAnimationStyles, isDesktopView, hasAllElements } from '@utils/animations'

export const REVEAL_DURATION = HERO.REVEAL_DURATION
export const REVEAL_OFFSET_X = HERO.REVEAL_OFFSET_X
export const EXIT_DURATION = HERO.EXIT_DURATION
export const EXIT_TEXT_OFFSET_X = HERO.EXIT_TEXT_OFFSET_X
export const EXIT_IMAGE_OFFSET_X = HERO.EXIT_IMAGE_OFFSET_X

export function getTextTargets(
  titleRef: HTMLHeadingElement | null,
  descriptionRef: HTMLParagraphElement | null,
  ctaRef: HTMLDivElement | null,
): HTMLElement[] {
  return filterElements(titleRef, descriptionRef, ctaRef)
}

export function resetHeroAnimation(
  titleRef: HTMLHeadingElement | null,
  descriptionRef: HTMLParagraphElement | null,
  ctaRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
) {
  if (!isDesktopView()) return

  const textTargets = getTextTargets(titleRef, descriptionRef, ctaRef)
  hideElements(textTargets, { offsetX: -REVEAL_OFFSET_X })
  if (imageRef) {
    gsap.set(imageRef, { opacity: 1, x: 0 })
  }
}

export function playRevealAnimation(
  titleRef: HTMLHeadingElement | null,
  descriptionRef: HTMLParagraphElement | null,
  ctaRef: HTMLDivElement | null,
): gsap.core.Timeline | null {
  if (!isDesktopView()) return null
  if (!hasAllElements(titleRef, descriptionRef, ctaRef)) return null

  const textTargets = getTextTargets(titleRef, descriptionRef, ctaRef)

  const tl = gsap.timeline().fromTo(
    textTargets,
    { opacity: 0, x: -REVEAL_OFFSET_X },
    { opacity: 1, x: 0, duration: REVEAL_DURATION, ease: EASE.REVEAL },
  )

  return tl
}

export function playExitAnimation(
  titleRef: HTMLHeadingElement | null,
  descriptionRef: HTMLParagraphElement | null,
  ctaRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
): gsap.core.Timeline | null {
  if (!isDesktopView()) return null
  if (!hasAllElements(titleRef, descriptionRef, ctaRef)) return null

  const textTargets = getTextTargets(titleRef, descriptionRef, ctaRef)

  const tl = gsap.timeline()
  tl.to(
    textTargets,
    { opacity: 0, x: -EXIT_TEXT_OFFSET_X, duration: EXIT_DURATION, ease: EASE.EXIT },
    0,
  )
  if (imageRef) {
    tl.to(
      imageRef,
      { opacity: 0, x: EXIT_IMAGE_OFFSET_X, duration: EXIT_DURATION, ease: EASE.EXIT },
      0,
    )
  }

  return tl
}

export function clearHeroAnimationStyles(
  titleRef: HTMLHeadingElement | null,
  descriptionRef: HTMLParagraphElement | null,
  ctaRef: HTMLDivElement | null,
  imageRef: HTMLImageElement | null,
) {
  clearAnimationStyles(titleRef, descriptionRef, ctaRef, imageRef)
}
