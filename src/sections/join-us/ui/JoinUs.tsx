import { Button3D } from '@components/ui'

type JoinUsProps = {
  onJoinClick: () => void
}

export default function JoinUs({ onJoinClick }: JoinUsProps) {
  return (
    <section className="join-us">
      <Button3D onClick={onJoinClick}>Join us</Button3D>
    </section>
  )
}
