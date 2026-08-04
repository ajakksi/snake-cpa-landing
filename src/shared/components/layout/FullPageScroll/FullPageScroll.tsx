import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const DESKTOP_QUERY = '(min-width: 1024px)'
const TRANSITION_DURATION = 0.85
const INNER_SCROLL_DURATION = 0.35
const INNER_EDGE_TOLERANCE = 1
const MIN_INNER_OVERFLOW = 80
const TOUCH_TRANSITION_THRESHOLD = 24
const WHEEL_GESTURE_IDLE_DELAY = 120
const WHEEL_RESTART_MIN_DELTA = 40
const WHEEL_RESTART_ACCELERATION = 3
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

type FullPageScrollProps = {
  enabled?: boolean
  suspended?: boolean
  onActiveSectionChange?: (sectionId: string) => void
  onSectionTransitionStart?: (fromSectionId: string, toSectionId: string) => void
}

function FullPageScroll({
  enabled = true,
  suspended = false,
  onActiveSectionChange,
  onSectionTransitionStart,
}: FullPageScrollProps) {
  const suspendedRef = useRef(suspended)

  useEffect(() => {
    suspendedRef.current = suspended
  }, [suspended])

  useEffect(() => {
    if (!enabled) return

    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-fullpage-section]'))
    const scrollers = sections.map((section) =>
      section.querySelector<HTMLElement>('[data-fullpage-scroll]'),
    )
    let currentIndex = 0
    let canScroll = true
    let ownsPageScrollLock = false
    let scrollTween: gsap.core.Tween | null = null
    let touchY: number | null = null
    let touchDistanceAtEdge = 0
    let touchInnerScrollConsumed = false
    let wheelGestureActive = false
    let wheelTransitionConsumed = false
    let wheelInnerScrollConsumed = false
    let previousWheelMagnitude = 0
    let wheelGestureTimer: ReturnType<typeof setTimeout> | null = null
    let lastWheelEventAt = 0
    let animationFrame = 0
    let activeUpdateFrame = 0
    const innerScrollTargets = new Map<HTMLElement, number>()
    const innerScrollTweens = new Map<HTMLElement, gsap.core.Tween>()

    const getWheelPixelDelta = (event: WheelEvent) => {
      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      return event.deltaY * multiplier
    }

    const finishWheelGestureAfterIdle = () => {
      const remainingDelay = WHEEL_GESTURE_IDLE_DELAY - (performance.now() - lastWheelEventAt)
      if (remainingDelay > 0) {
        wheelGestureTimer = setTimeout(finishWheelGestureAfterIdle, remainingDelay)
        return
      }

      wheelGestureActive = false
      wheelGestureTimer = null
      previousWheelMagnitude = 0
      if (canScroll) {
        wheelTransitionConsumed = false
        wheelInnerScrollConsumed = false
      }
    }

    // Resolves the section whose top edge the document has most recently crossed.
    const getSectionIndexAtWindowScroll = () => {
      let index = 0
      sections.forEach((section, sectionIndex) => {
        if (section.offsetTop <= window.scrollY + 2) index = sectionIndex
      })
      return index
    }

    // Keeps external consumers in sync with the active section.
    const publishActiveSection = (index: number) => {
      const sectionId = sections[index]?.id
      if (sectionId) onActiveSectionChange?.(sectionId)
    }

    // Stops every in-flight inner tween when full-page mode is switched off.
    const stopInnerScrollTweens = () => {
      innerScrollTweens.forEach((tween) => {
        tween.kill()
      })
      innerScrollTweens.clear()
    }

    // Removes only the overflow lock created by this controller.
    const releasePageScrollLock = () => {
      if (!ownsPageScrollLock) return

      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('overflow')
      ownsPageScrollLock = false
    }

    // Fully enables or disables the GSAP desktop mode at the 1024px breakpoint.
    const setDesktopScrollMode = () => {
      if (mediaQuery.matches) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        ownsPageScrollLock = true
        currentIndex = getSectionIndexAtWindowScroll()
        window.scrollTo({ top: sections[currentIndex]?.offsetTop ?? 0 })
        publishActiveSection(currentIndex)
      } else {
        scrollTween?.kill()
        stopInnerScrollTweens()
        scrollTween = null
        canScroll = true
        releasePageScrollLock()
        currentIndex = getSectionIndexAtWindowScroll()
        publishActiveSection(currentIndex)
      }
    }

    // Positions a tall destination at its bottom when entering backwards, or at its top otherwise.
    const prepareInnerScroll = (targetIndex: number, direction: number, fromAnchor = false) => {
      const scroller = scrollers[targetIndex]
      if (!scroller) return

      innerScrollTweens.get(scroller)?.kill()
      const maxInnerScroll = scroller.scrollHeight - scroller.clientHeight
      const targetScroll =
        direction < 0 && !fromAnchor && maxInnerScroll > MIN_INNER_OVERFLOW ? maxInnerScroll : 0
      scroller.scrollTop = targetScroll
      innerScrollTargets.set(scroller, targetScroll)
      innerScrollTweens.delete(scroller)
    }

    // Smoothly accumulates wheel/touch deltas without creating visible scrollTop jumps.
    const smoothScrollInside = (scroller: HTMLElement, target: number, touchInput: boolean) => {
      innerScrollTweens.get(scroller)?.kill()
      innerScrollTargets.set(scroller, target)

      const tween = gsap.to(scroller, {
        scrollTop: target,
        duration: touchInput ? 0.2 : INNER_SCROLL_DURATION,
        ease: 'power2.out',
        overwrite: true,
        onComplete: () => innerScrollTweens.delete(scroller),
        onInterrupt: () => innerScrollTweens.delete(scroller),
      })
      innerScrollTweens.set(scroller, tween)
    }

    // Locks input and moves the document to a section; input unlocks only after GSAP finishes.
    const animateToSection = (targetIndex: number, direction: number, fromAnchor = false) => {
      const targetSection = sections[targetIndex]
      if (!targetSection || targetIndex === currentIndex || !canScroll) return

      onSectionTransitionStart?.(sections[currentIndex].id, targetSection.id)
      canScroll = false
      prepareInnerScroll(targetIndex, direction, fromAnchor)

      scrollTween = gsap.to(window, {
        scrollTo: { y: targetSection.offsetTop, autoKill: false },
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => {
          currentIndex = targetIndex
          publishActiveSection(targetIndex)
          scrollTween = null
          canScroll = true
          if (!wheelGestureActive) wheelTransitionConsumed = false
        },
        onInterrupt: () => {
          currentIndex = getSectionIndexAtWindowScroll()
          publishActiveSection(currentIndex)
          scrollTween = null
          canScroll = true
          if (!wheelGestureActive) wheelTransitionConsumed = false
        },
      })
    }

    // Routes input to the current section's overflow first, then to the adjacent section at an edge.
    const moveInsideOrBetweenSections = (
      delta: number,
      touchInput = false,
      allowSectionTransition = true,
    ) => {
      if (!canScroll || delta === 0) return false

      const direction = Math.sign(delta)
      const scroller = scrollers[currentIndex]
      const maxInnerScroll = scroller ? scroller.scrollHeight - scroller.clientHeight : 0
      const hasMeaningfulInnerScroll = maxInnerScroll > MIN_INNER_OVERFLOW
      const currentInnerTarget = scroller
        ? (innerScrollTargets.get(scroller) ?? scroller.scrollTop)
        : 0
      const canMoveInside =
        scroller &&
        hasMeaningfulInnerScroll &&
        ((direction > 0 && currentInnerTarget < maxInnerScroll - INNER_EDGE_TOLERANCE) ||
          (direction < 0 && currentInnerTarget > INNER_EDGE_TOLERANCE))

      if (canMoveInside) {
        const nextInnerTarget = Math.max(0, Math.min(maxInnerScroll, currentInnerTarget + delta))
        smoothScrollInside(scroller, nextInnerTarget, touchInput)
        touchDistanceAtEdge = 0
        return true
      }

      if (scroller && !hasMeaningfulInnerScroll && scroller.scrollTop !== 0) {
        innerScrollTweens.get(scroller)?.kill()
        scroller.scrollTop = 0
        innerScrollTargets.set(scroller, 0)
      }

      // The target may already be at the edge while its smoothing tween is still running.
      if (
        scroller &&
        hasMeaningfulInnerScroll &&
        ((direction > 0 && scroller.scrollTop < maxInnerScroll - INNER_EDGE_TOLERANCE) ||
          (direction < 0 && scroller.scrollTop > INNER_EDGE_TOLERANCE))
      ) {
        return false
      }

      if (touchInput) {
        touchDistanceAtEdge += Math.abs(delta)
        if (touchDistanceAtEdge < TOUCH_TRANSITION_THRESHOLD) return false
      }

      touchDistanceAtEdge = 0
      if (!allowSectionTransition) return false
      animateToSection(currentIndex + direction, direction)
      return false
    }

    // Normalizes mouse-wheel and trackpad input into pixel deltas.
    const onWheel = (event: WheelEvent) => {
      if (
        suspendedRef.current ||
        !mediaQuery.matches ||
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return
      }
      if ((event.target as Element | null)?.closest('[role="dialog"]')) return

      event.preventDefault()

      const pixelDeltaY = getWheelPixelDelta(event)
      const wheelMagnitude = Math.abs(pixelDeltaY)
      const hasRenewedIntent =
        (wheelTransitionConsumed || wheelInnerScrollConsumed) &&
        canScroll &&
        wheelMagnitude >= WHEEL_RESTART_MIN_DELTA &&
        previousWheelMagnitude > 0 &&
        wheelMagnitude >= previousWheelMagnitude * WHEEL_RESTART_ACCELERATION

      wheelGestureActive = true
      lastWheelEventAt = performance.now()
      if (wheelGestureTimer === null) {
        wheelGestureTimer = setTimeout(finishWheelGestureAfterIdle, WHEEL_GESTURE_IDLE_DELAY)
      }
      previousWheelMagnitude = wheelMagnitude

      if (hasRenewedIntent) {
        wheelTransitionConsumed = false
        wheelInnerScrollConsumed = false
      }

      if (!canScroll || wheelTransitionConsumed) return

      const movedInside = moveInsideOrBetweenSections(pixelDeltaY, false, !wheelInnerScrollConsumed)
      if (movedInside) wheelInnerScrollConsumed = true
      if (!canScroll) wheelTransitionConsumed = true
    }

    // Starts tracking a desktop/tablet touch gesture.
    const onTouchStart = (event: TouchEvent) => {
      if (suspendedRef.current || !mediaQuery.matches) return
      touchY = event.touches[0]?.clientY ?? null
      touchDistanceAtEdge = 0
      touchInnerScrollConsumed = false
    }

    // Converts the touch movement into the same directional delta used by the wheel handler.
    const onTouchMove = (event: TouchEvent) => {
      if (suspendedRef.current || !mediaQuery.matches || touchY === null) return
      if ((event.target as Element | null)?.closest('[role="dialog"]')) return

      event.preventDefault()
      const nextTouchY = event.touches[0]?.clientY
      if (nextTouchY === undefined) return

      const delta = touchY - nextTouchY
      touchY = nextTouchY
      if (!canScroll) return
      const movedInside = moveInsideOrBetweenSections(delta, true, !touchInnerScrollConsumed)
      if (movedInside) touchInnerScrollConsumed = true
    }

    // Provides keyboard equivalents for inner scrolling and section navigation.
    const onKeyDown = (event: KeyboardEvent) => {
      if (suspendedRef.current || !mediaQuery.matches || !SCROLL_KEYS.has(event.key)) return
      if ((event.target as Element | null)?.closest('input, textarea, select, [contenteditable]'))
        return

      event.preventDefault()
      if (!canScroll) return

      if (event.key === 'Home') {
        animateToSection(0, -1, true)
        return
      }
      if (event.key === 'End') {
        animateToSection(sections.length - 1, 1, true)
        return
      }

      const direction = event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1
      const distance = event.key.startsWith('Arrow') ? 60 : window.innerHeight * 0.8
      moveInsideOrBetweenSections(direction * distance)
    }

    // Sends header, footer, and dot anchors through GSAP on desktop and native smooth scroll on mobile.
    const onAnchorClick = (event: MouseEvent) => {
      if (suspendedRef.current) return

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return

      const targetIndex = sections.findIndex((section) => `#${section.id}` === anchor.hash)
      if (targetIndex < 0) return

      event.preventDefault()
      if (mediaQuery.matches) {
        animateToSection(targetIndex, targetIndex < currentIndex ? -1 : 1, true)
      } else {
        sections[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      window.history.replaceState(null, '', anchor.hash)
    }

    // Tracks the active section during ordinary mobile scrolling.
    const onNativeScroll = () => {
      if (mediaQuery.matches) return
      cancelAnimationFrame(activeUpdateFrame)
      activeUpdateFrame = requestAnimationFrame(() => {
        currentIndex = getSectionIndexAtWindowScroll()
        publishActiveSection(currentIndex)
      })
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('scroll', onNativeScroll, { passive: true })
    document.addEventListener('click', onAnchorClick)
    mediaQuery.addEventListener('change', setDesktopScrollMode)

    animationFrame = requestAnimationFrame(() => {
      currentIndex = getSectionIndexAtWindowScroll()
      publishActiveSection(currentIndex)
      setDesktopScrollMode()
    })

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('scroll', onNativeScroll)
      document.removeEventListener('click', onAnchorClick)
      mediaQuery.removeEventListener('change', setDesktopScrollMode)
      cancelAnimationFrame(animationFrame)
      cancelAnimationFrame(activeUpdateFrame)
      if (wheelGestureTimer !== null) clearTimeout(wheelGestureTimer)
      scrollTween?.kill()
      stopInnerScrollTweens()
      releasePageScrollLock()
    }
  }, [enabled, onActiveSectionChange, onSectionTransitionStart])

  return null
}

export default FullPageScroll
