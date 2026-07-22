import { Link } from 'react-router-dom'
import snake404 from '@assets/images/snake-hero.png'

function NotFound() {
  return (
    <main>
      <p>404</p>
      <p>Page not found</p>
      <img src={snake404} alt="Snake illustration" />

      <Link to="/">OOPS, TAKE ME BACK</Link>
    </main>
  )
}

export default NotFound
