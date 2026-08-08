import { useCallback, useState } from 'react'
import LogoIcon from '@assets/icons/logo.svg?react'
import { ContactForm } from '@components/common'
import { Footer, FullPageScroll, PageBackground } from '@components/layout'
import { Modal } from '@components/ui'
import Preloader from '@components/ui/preloader/Preloader'
import { Hero } from '@sections/hero'
import { JoinUs } from '@sections/join-us'
import { MultiBenefits } from '@sections/multi-benefits'
import { MultiTasks } from '@sections/multi-tasks'
import { usePreloaderReady } from '@hooks/usePreloaderReady'
import { useIsMobile } from '@hooks/useDeviceType'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDarkBackground, setIsDarkBackground] = useState(false)
  const isMobile = useIsMobile()
  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const isReady = usePreloaderReady()

  const handleActiveSectionChange = useCallback((sectionId: string) => {
    setIsDarkBackground(!isMobile && sectionId === 'team')
  }, [isMobile])

  const handleSectionTransitionStart = useCallback((fromSectionId: string, toSectionId: string) => {
    if (!isMobile) {
      if (toSectionId === 'team') {
        setIsDarkBackground(true)
      } else if (fromSectionId === 'team') {
        setIsDarkBackground(false)
      }
    }
  }, [isMobile])

  return (
    <>
      <Preloader isReady={isReady} />
      {isReady && <PageBackground variant={isDarkBackground ? 'dark' : 'main'} />}
      <FullPageScroll
        enabled={isReady}
        suspended={isModalOpen}
        onActiveSectionChange={handleActiveSectionChange}
        onSectionTransitionStart={handleSectionTransitionStart}
      />

      <div className="relative z-10">
        <main>
          <Hero onJoinClick={openModal} />
          <MultiTasks />
          <MultiBenefits />
          <JoinUs onJoinClick={openModal} />
        </main>

        <Footer />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Join us">
        <LogoIcon
          aria-hidden="true"
          className="mx-auto h-16 w-[70px] [&_ellipse]:fill-purple [&_path]:fill-purple"
        />
        <ContactForm onDone={closeModal} />
      </Modal>
    </>
  )
}

export default Home