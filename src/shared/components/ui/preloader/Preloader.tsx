import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import snakeLogo from '@assets/icons/logo.svg'
import PageBackground from '@components/layout/PageBackground/PageBackground'
import styles from './Preloader.module.scss'

interface PreloaderProps {
  isReady: boolean
}

const PHASE_1_DURATION = 2.5
const PHASE_1_TARGET = 75
const PHASE_2_TARGET = 98
const PHASE_2_DURATION = 45
const FINAL_RUSH_DURATION = 0.4
const FADE_OUT_DURATION = 0.6

export default function Preloader({ isReady }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const percentageRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const prevIsReadyRef = useRef(isReady)
  const [isVisible, setIsVisible] = useState(true)
  const animationStateRef = useRef<{
    currentPercent: number
    phase: 'phase1' | 'phase2' | 'finalRush' | 'complete'
    phase1Complete: boolean
    readyReceived: boolean
  }>({
    currentPercent: 0,
    phase: 'phase1',
    phase1Complete: false,
    readyReceived: false,
  })

  useEffect(() => {
    if (prevIsReadyRef.current && !isReady && !isVisible) {
      setIsVisible(true)
      animationStateRef.current = {
        currentPercent: 0,
        phase: 'phase1',
        phase1Complete: false,
        readyReceived: false,
      }
    }
    prevIsReadyRef.current = isReady
  }, [isReady, isVisible])

  useEffect(() => {
    if (isVisible) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      return () => {
        document.body.style.overflow = ''
        // Use a small delay to prevent layout shift when scrollbar appears
        setTimeout(() => {
          document.body.style.paddingRight = ''
        }, 0)
      }
    }
  }, [isVisible])

  function updateDisplay() {
    const state = animationStateRef.current
    const percent = Math.round(state.currentPercent)

    if (percentageRef.current) {
      percentageRef.current.textContent = `${percent}%`
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${state.currentPercent}%`
    }
  }

  const startPhase1 = useCallback(() => {
    if (!containerRef.current || !percentageRef.current || !progressBarRef.current) return

    const state = animationStateRef.current
    if (state.phase !== 'phase1' || state.phase1Complete) return

    const tl = gsap.timeline()

    tl.to(
      state,
      {
        currentPercent: PHASE_1_TARGET,
        duration: PHASE_1_DURATION,
        ease: 'linear',
        onUpdate: () => {
          updateDisplay()
        },
      },
      0,
    ).add(() => {
      state.phase1Complete = true
      if (state.readyReceived) {
        startFinalRush()
      } else {
        startPhase2()
      }
    })
  }, [])

  function startPhase2() {
    const state = animationStateRef.current
    if (state.phase !== 'phase1') return

    state.phase = 'phase2'

    gsap.to(state, {
      currentPercent: PHASE_2_TARGET,
      duration: PHASE_2_DURATION,
      ease: 'power1.out',
      onUpdate: () => {
        updateDisplay()
      },
    })
  }

  function startFinalRush() {
    const state = animationStateRef.current
    if (state.phase === 'finalRush' || state.phase === 'complete') return

    state.phase = 'finalRush'

    gsap.killTweensOf(state)

    gsap.to(state, {
      currentPercent: 100,
      duration: FINAL_RUSH_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => {
        updateDisplay()
      },
      onComplete: () => {
        fadeOut()
      },
    })
  }

  function fadeOut() {
    const state = animationStateRef.current
    if (state.phase === 'complete') return

    state.phase = 'complete'

    if (!containerRef.current) {
      setIsVisible(false)
      return
    }

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: FADE_OUT_DURATION,
      ease: 'power2.inOut',
      onStart: () => {
        if (containerRef.current) {
          containerRef.current.style.pointerEvents = 'none'
        }
      },
      onComplete: () => {
        setIsVisible(false)
      },
    })
  }

  useEffect(() => {
    if (!containerRef.current || !percentageRef.current || !progressBarRef.current) return

    const state = animationStateRef.current
    state.readyReceived = isReady

    if (
      state.readyReceived &&
      ((state.phase === 'phase1' && state.phase1Complete) || state.phase === 'phase2')
    ) {
      startFinalRush()
    }
  }, [isReady])

  useEffect(() => {
    if (
      isVisible &&
      animationStateRef.current.phase === 'phase1' &&
      !animationStateRef.current.phase1Complete
    ) {
      startPhase1()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading content"
    >
      <PageBackground variant="main" className={styles.background} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <img src={snakeLogo} alt="" className={styles.logo} aria-hidden="true" />
            <div className={styles.menuPlaceholder}>MENU</div>
          </div>

          <div className={styles.centerContent}>
            <div ref={percentageRef} className={styles.percentage}>
              0%
            </div>
            <div className={styles.progressContainer}>
              <div ref={progressBarRef} className={styles.progressBar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
