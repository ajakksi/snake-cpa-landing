import { Link } from 'react-router-dom'
import snake404 from '@assets/images/snake-hero.png'
import { PageBackground } from '@components/layout'

function NotFound() {
  return (
    <>
      <PageBackground />

      <main className="relative z-10 min-h-dvh">
        <p>404</p>
        <p>Page not found</p>
        <img src={snake404} alt="Snake illustration" />

        <Link to="/">OOPS, TAKE ME BACK</Link>
      </main>
    </>
  )
}

export default NotFound
