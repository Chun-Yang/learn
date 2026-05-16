import { Link } from 'wouter'

function Home() {
  return (
    <div>
      <h1>Learn</h1>
      <div className="home-buttons">
        <Link href="/addition" className="btn">Single Digit Addition</Link>
        <Link href="/multiplication" className="btn">Single Digit Multiplication</Link>
      </div>
    </div>
  )
}

export default Home
