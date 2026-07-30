import { useCallback, useState } from 'react'
import { ContactForm } from '@components/common'
import { PageBackground } from '@components/layout'
import { Modal } from '@components/ui'
import { Hero } from '@sections/hero'
import { JoinUs } from '@sections/join-us'
import { MultiBenefits } from '@sections/multi-benefits'
import { MultiTasks } from '@sections/multi-tasks'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  return (
    <>
      <PageBackground />

      <main className="relative z-10">
        <Hero onJoinClick={openModal} />
        <MultiTasks />
        <MultiBenefits />
        <JoinUs onJoinClick={openModal} />
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Join us">
        <ContactForm onDone={closeModal} />
      </Modal>
    </>
  )
}

export default Home
