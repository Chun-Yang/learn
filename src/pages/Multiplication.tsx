import SelectionPage from './SelectionPage'
import { Link } from 'wouter'

function Multiplication() {
  return (
    <>
      <SelectionPage
        title="Single Digit Multiplication"
        operation="multiplication"
        exercisePath="/multiplication-exercise"
        defaultDigits={[2, 3, 4, 5, 6, 7, 8, 9]}
        startAction={<Link href="/multiplication-random" className="btn">Random</Link>}
      />
    </>
  )
}

export default Multiplication
