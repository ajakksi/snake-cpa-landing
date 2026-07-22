import { Hero } from '@sections/hero'
import { JoinUs } from '@sections/join-us'
import { MultiBenefits } from '@sections/multi-benefits'
import { MultiTasks } from '@sections/multi-tasks'

function Home() {
  return (
    <>
      <main>
        <Hero />
        <MultiTasks />
        <MultiBenefits />
        <JoinUs />
      </main>
    </>
  )
}

export default Home
