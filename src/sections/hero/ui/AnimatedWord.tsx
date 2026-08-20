import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'

const WORDS = ['profit', 'skills', 'growth'] as const
const SEQUENCE = [...WORDS, WORDS[0]]
const STEP_PERCENT = 100 / SEQUENCE.length

const WORD_DURATION = 1.2
const SLIDE_DURATION = 0.25
const EASE = 'power2.inOut'

export default function AnimatedWord() {
  const rootRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const list = listRef.current
      if (!list) return

      gsap.set(list, { yPercent: 0 })

      const tl = gsap.timeline({ repeat: -1 })

      WORDS.forEach((_, i) => {
        tl.to(list, { duration: WORD_DURATION }).to(list, {
          yPercent: -(STEP_PERCENT * (i + 1)),
          duration: SLIDE_DURATION,
          ease: EASE,
        })
      })

      tl.set(list, { yPercent: 0 })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <span
      ref={rootRef}
      className="relative inline-block text-yellow overflow-hidden whitespace-nowrap"
      style={{ lineHeight: 1, transform: 'translateY(0.0375em)' }}
    >
      <span className="sr-only">profit</span>

      <span className="invisible grid" aria-hidden="true">
        {WORDS.map((word) => (
          <span key={word} className="whitespace-nowrap" style={{ gridArea: '1 / 1' }}>
            {word}
          </span>
        ))}
      </span>

      <span
        ref={listRef}
        aria-hidden="true"
        className="absolute left-0 top-0 flex flex-col"
        style={{ lineHeight: 1 }}
      >
        {SEQUENCE.map((word, i) => (
          <span key={i} className="whitespace-nowrap">
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}
