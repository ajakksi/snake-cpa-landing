import gsap from 'gsap'
import { JOIN_US, EASE } from '@constants/animations'
import { filterElements, hideElements, clearAnimationStyles, isDesktopView, hasAllElements } from '@utils/animations'

export const REVEAL_DURATION = JOIN_US.REVEAL_DURATION

export function getGroups(
  tabsRef: HTMLDivElement | null,
  panelRef: HTMLDivElement | null,
): HTMLElement[] {
  return filterElements(tabsRef, panelRef)
}

export function hideJoinUsContent(tabsRef: HTMLDivElement | null, panelRef: HTMLDivElement | null) {
  if (!isDesktopView()) return
  hideElements(filterElements(tabsRef, panelRef))
}

export function playRevealAnimation(
  tabsRef: HTMLDivElement | null,
  panelRef: HTMLDivElement | null,
): gsap.core.Timeline | null {
  if (!isDesktopView()) return null
  if (!hasAllElements(tabsRef, panelRef)) return null

  const groups = getGroups(tabsRef, panelRef)

  hideJoinUsContent(tabsRef, panelRef)

  const tl = gsap.timeline()

  tl.to(
    groups,
    { opacity: 1, duration: REVEAL_DURATION, ease: EASE.FADE, overwrite: true },
    0,
  )

  return tl
}

export function clearJoinUsAnimationStyles(
  tabsRef: HTMLDivElement | null,
  panelRef: HTMLDivElement | null,
) {
  clearAnimationStyles(tabsRef, panelRef)
}
