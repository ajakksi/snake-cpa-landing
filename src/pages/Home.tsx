import { useCallback, useState } from 'react'
import LogoIcon from '@assets/icons/logo.svg?react'
import { ContactForm } from '@components/common'
import { Footer, PageBackground } from '@components/layout'
import { Modal } from '@components/ui'
import Preloader from '@components/ui/preloader/Preloader'
import { Hero } from '@sections/hero'
import { JoinUs } from '@sections/join-us'
import { MultiBenefits } from '@sections/multi-benefits'
import { MultiTasks } from '@sections/multi-tasks'
import { usePreloaderReady } from '@hooks/usePreloaderReady'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const isReady = usePreloaderReady()

  return (
    <>
      <Preloader isReady={isReady} />
      {isReady && <PageBackground />}

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
