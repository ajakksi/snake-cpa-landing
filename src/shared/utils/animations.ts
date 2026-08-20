import gsap from 'gsap'
import { DESKTOP_QUERY } from '@constants/animations'

export type HideConfig = {
  offsetX?: number
  offsetY?: number
}

export function isDesktopView(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

export function filterElements(...elements: (HTMLElement | null)[]): HTMLElement[] {
  return elements.filter((el): el is HTMLElement => el !== null)
}

export function hideElements(elements: HTMLElement[], config: HideConfig = {}): void {
  if (!isDesktopView()) return
  if (elements.length === 0) return

  gsap.set(elements, {
    opacity: 0,
    x: config.offsetX ?? 0,
    y: config.offsetY ?? 0,
  })
}

export function hideElement(element: HTMLElement | null, config: HideConfig = {}): void {
  if (!element || !isDesktopView()) return

  gsap.set(element, {
    opacity: 0,
    x: config.offsetX ?? 0,
    y: config.offsetY ?? 0,
  })
}

export function clearAnimationStyles(...elements: (HTMLElement | null)[]): void {
  const filtered = filterElements(...elements)
  if (filtered.length === 0) return

  gsap.set(filtered, { clearProps: 'all' })
}

export function hasAllElements(...elements: (HTMLElement | null)[]): boolean {
  return elements.every((el) => el !== null)
}

export function onMediaQueryChange(callback: (matches: boolean) => void): () => void {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches)
  }

  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}
