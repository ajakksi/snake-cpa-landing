import { lazy, Suspense, useCallback, useState } from 'react'
import LogoIcon from '@assets/icons/logo.svg?react'
import { Footer, FullPageScroll, PageBackground } from '@components/layout'
import { Modal } from '@components/ui'
import Preloader from '@components/ui/preloader/Preloader'
import { Hero } from '@sections/hero'
import { JoinUs } from '@sections/join-us'
import { MultiBenefits } from '@sections/multi-benefits'
import { MultiTasks } from '@sections/multi-tasks'
import { usePreloaderReady } from '@hooks/usePreloaderReady'
import { useIsMobile } from '@hooks/useDeviceType'
import { useAnimationManager } from '@hooks/useAnimationManager'

const ContactForm = lazy(() =>
  import('@components/common').then(({ ContactForm }) => ({ default: ContactForm })),
)

const SECTIONS = [
  { id: 'hero', hasExitAnimation: true },
  { id: 'team' },
  { id: 'benefits' },
  { id: 'join-us' },
]

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDarkBackground, setIsDarkBackground] = useState(false)
  const isMobile = useIsMobile()
  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const isReady = usePreloaderReady()
  const {
    triggers,
    handlePreloaderComplete,
    handleActiveSectionChange,
    handleSectionTransitionStart,
  } = useAnimationManager(SECTIONS, isReady)

  const handleActiveSectionChangeWithBackground = useCallback(
    (sectionId: string) => {
      setIsDarkBackground(!isMobile && sectionId === 'team')
      handleActiveSectionChange(sectionId)
    },
    [handleActiveSectionChange, isMobile],
  )

  const handleSectionTransitionStartWithBackground = useCallback(
    (fromSectionId: string, toSectionId: string) => {
      if (!isMobile) {
        if (toSectionId === 'team') {
          setIsDarkBackground(true)
        } else if (fromSectionId === 'team') {
          setIsDarkBackground(false)
        }
      }
      handleSectionTransitionStart(fromSectionId, toSectionId)
    },
    [handleSectionTransitionStart, isMobile],
  )
  return (
    <>
      <Preloader isReady={isReady} onComplete={handlePreloaderComplete} />
      {isReady && <PageBackground variant={isDarkBackground ? 'dark' : 'main'} />}
      <FullPageScroll
        enabled={isReady}
        suspended={isModalOpen}
        onActiveSectionChange={handleActiveSectionChangeWithBackground}
        onSectionTransitionStart={handleSectionTransitionStartWithBackground}
      />

      <div className="relative z-10">
        <main>
          <Hero
            onJoinClick={openModal}
            playTrigger={triggers.hero.playTrigger}
            resetTrigger={triggers.hero.resetTrigger}
            exitTrigger={triggers.hero.exitTrigger ?? 0}
          />
          <MultiTasks
            playTrigger={triggers.team.playTrigger}
            resetTrigger={triggers.team.resetTrigger}
          />
          <MultiBenefits
            playTrigger={triggers.benefits.playTrigger}
            resetTrigger={triggers.benefits.resetTrigger}
          />
          <JoinUs
            onJoinClick={openModal}
            playTrigger={triggers['join-us'].playTrigger}
            resetTrigger={triggers['join-us'].resetTrigger}
          />
        </main>

        <Footer />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Join us">
        <LogoIcon
          aria-hidden="true"
          className="mx-auto h-16 w-[70px] [&_ellipse]:fill-purple [&_path]:fill-purple"
        />
        <Suspense
          fallback={
            <div className="min-h-[20rem]" role="status" aria-label="Loading contact form" />
          }
        >
          <ContactForm onDone={closeModal} />
        </Suspense>
      </Modal>
    </>
  )
}

export default Home
