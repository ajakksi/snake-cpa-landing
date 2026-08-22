import gsap from 'gsap'
import { DESKTOP_QUERY } from '@constants/animations'
import { getDeviceType } from '@hooks/useDeviceType'

export type HideConfig = {
  offsetX?: number
  offsetY?: number
}

export function isDesktopView(): boolean {
  return getDeviceType() === 'desktop'
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

  if (isDesktopView()) {
    gsap.set(filtered, { clearProps: 'all' })
    return
  }

  // Wide touchscreens still match Tailwind's `lg:` hiding classes, so expose
  // their content explicitly while keeping it at the neutral end position.
  gsap.set(filtered, { opacity: 1, x: 0, y: 0 })
}

export function hasAllElements(...elements: (HTMLElement | null)[]): boolean {
  return elements.every((el) => el !== null)
}

export function onMediaQueryChange(callback: (matches: boolean) => void): () => void {
  const mediaQueries = [
    window.matchMedia(DESKTOP_QUERY),
    window.matchMedia('(hover: none)'),
    window.matchMedia('(pointer: coarse)'),
  ]
  const handleChange = () => {
    callback(isDesktopView())
  }

  handleChange()
  mediaQueries.forEach((mediaQuery) => mediaQuery.addEventListener('change', handleChange))
  return () =>
    mediaQueries.forEach((mediaQuery) => mediaQuery.removeEventListener('change', handleChange))
}
