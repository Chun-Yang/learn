import { Link } from 'wouter'

function Home() {
  return (
    <div>
      <h1>Learn</h1>
      <div className="home-buttons">
        <Link href="/addition" className="btn">Single Digit Addition</Link>
      </div>
    </div>
  )
}

export default Home
