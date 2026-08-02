import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

const DESKTOP_QUERY = '(min-width: 1024px)'
const TRANSITION_DURATION = 0.85
const INNER_SCROLL_DURATION = 0.35
const INNER_EDGE_TOLERANCE = 1
const MIN_INNER_OVERFLOW = 80
const TOUCH_TRANSITION_THRESHOLD = 24
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

type FullPageScrollProps = {
  enabled?: boolean
  onActiveSectionChange?: (sectionId: string) => void
  onSectionTransitionStart?: (fromSectionId: string, toSectionId: string) => void
}

function FullPageScroll({
  enabled = true,
  onActiveSectionChange,
  onSectionTransitionStart,
}: FullPageScrollProps) {
  const [sectionIds, setSectionIds] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-fullpage-section]'))
    const scrollers = sections.map((section) =>
      section.querySelector<HTMLElement>('[data-fullpage-scroll]'),
    )
    const initialHtmlOverflow = document.documentElement.style.overflow
    const initialBodyOverflow = document.body.style.overflow
    let currentIndex = 0
    let canScroll = true
    let scrollTween: gsap.core.Tween | null = null
    let touchY: number | null = null
    let touchDistanceAtEdge = 0
    let animationFrame = 0
    let activeUpdateFrame = 0
    const innerScrollTargets = new Map<HTMLElement, number>()
    const innerScrollTweens = new Map<HTMLElement, gsap.core.Tween>()

    // Resolves the section whose top edge the document has most recently crossed.
    const getSectionIndexAtWindowScroll = () => {
      let index = 0
      sections.forEach((section, sectionIndex) => {
        if (section.offsetTop <= window.scrollY + 2) index = sectionIndex
      })
      return index
    }

    // Keeps the navigation UI and external consumers in sync with one active section.
    const publishActiveSection = (index: number) => {
      setActiveIndex(index)
      const sectionId = sections[index]?.id
      if (sectionId) onActiveSectionChange?.(sectionId)
    }

    const sectionTriggers = sections.map((section, index) =>
      ScrollTrigger.create({
        id: `fullpage-${section.id}`,
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        invalidateOnRefresh: true,
        // ScrollTrigger only drives the dots during a tween. External section state is
        // published explicitly at transition boundaries to avoid background flicker.
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      }),
    )

    // Stops every in-flight inner tween when full-page mode is switched off.
    const stopInnerScrollTweens = () => {
      innerScrollTweens.forEach((tween) => {
        tween.kill()
      })
      innerScrollTweens.clear()
    }

    // Fully enables or disables the GSAP desktop mode at the 1024px breakpoint.
    const setDesktopScrollMode = () => {
      if (mediaQuery.matches) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        sectionTriggers.forEach((trigger) => trigger.enable())
        currentIndex = getSectionIndexAtWindowScroll()
        window.scrollTo({ top: sections[currentIndex]?.offsetTop ?? 0 })
        publishActiveSection(currentIndex)
      } else {
        scrollTween?.kill()
        stopInnerScrollTweens()
        scrollTween = null
        canScroll = true
        sectionTriggers.forEach((trigger) => trigger.disable(false))
        document.documentElement.style.overflow = initialHtmlOverflow
        document.body.style.overflow = initialBodyOverflow
        currentIndex = getSectionIndexAtWindowScroll()
        publishActiveSection(currentIndex)
      }
      ScrollTrigger.refresh()
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
      // The dot can react immediately, while external visuals wait until the section arrives.
      setActiveIndex(targetIndex)

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
        },
        onInterrupt: () => {
          currentIndex = getSectionIndexAtWindowScroll()
          publishActiveSection(currentIndex)
          scrollTween = null
          canScroll = true
        },
      })
    }

    // Routes input to the current section's overflow first, then to the adjacent section at an edge.
    const moveInsideOrBetweenSections = (delta: number, touchInput = false) => {
      if (!canScroll || delta === 0) return

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
        return
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
        return
      }

      if (touchInput) {
        touchDistanceAtEdge += Math.abs(delta)
        if (touchDistanceAtEdge < TOUCH_TRANSITION_THRESHOLD) return
      }

      touchDistanceAtEdge = 0
      animateToSection(currentIndex + direction, direction)
    }

    // Normalizes mouse-wheel and trackpad input into pixel deltas.
    const onWheel = (event: WheelEvent) => {
      if (
        !mediaQuery.matches ||
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return
      }
      if ((event.target as Element | null)?.closest('[role="dialog"]')) return

      event.preventDefault()
      if (!canScroll) return

      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      moveInsideOrBetweenSections(event.deltaY * multiplier)
    }

    // Starts tracking a desktop/tablet touch gesture.
    const onTouchStart = (event: TouchEvent) => {
      if (!mediaQuery.matches) return
      touchY = event.touches[0]?.clientY ?? null
      touchDistanceAtEdge = 0
    }

    // Converts the touch movement into the same directional delta used by the wheel handler.
    const onTouchMove = (event: TouchEvent) => {
      if (!mediaQuery.matches || touchY === null) return
      if ((event.target as Element | null)?.closest('[role="dialog"]')) return

      event.preventDefault()
      const nextTouchY = event.touches[0]?.clientY
      if (nextTouchY === undefined || !canScroll) return

      const delta = touchY - nextTouchY
      touchY = nextTouchY
      moveInsideOrBetweenSections(delta, true)
    }

    // Provides keyboard equivalents for inner scrolling and section navigation.
    const onKeyDown = (event: KeyboardEvent) => {
      if (!mediaQuery.matches || !SCROLL_KEYS.has(event.key)) return
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

    // Tracks the active section during ordinary mobile scrolling while ScrollTrigger is disabled.
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
      setSectionIds(sections.map((section) => section.id))
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
      scrollTween?.kill()
      stopInnerScrollTweens()
      sectionTriggers.forEach((trigger) => trigger.kill())
      document.documentElement.style.overflow = initialHtmlOverflow
      document.body.style.overflow = initialBodyOverflow
    }
  }, [enabled, onActiveSectionChange, onSectionTransitionStart])

  if (!enabled || sectionIds.length < 2) return null

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {sectionIds.map((id, index) => (
        <a
          key={id}
          href={`#${id}`}
          aria-label={`Go to section ${index + 1}`}
          aria-current={index === activeIndex ? 'location' : undefined}
          className={`block h-3 w-3 rounded-full border border-yellow shadow-[0_0_0_1px_rgba(26,27,31,0.35)] transition-[background-color,transform,box-shadow] duration-300 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow ${
            index === activeIndex
              ? 'scale-125 bg-yellow shadow-[0_0_12px_rgba(255,221,0,0.8)]'
              : 'bg-dark/30'
          }`}
        />
      ))}
    </nav>
  )
}

export default FullPageScroll
