import SelectionPage from './SelectionPage'

function Multiplication() {
  return (
    <SelectionPage
      title="Single Digit Multiplication"
      operation="multiplication"
      exercisePath="/multiplication-exercise"
      defaultDigits={[2, 3, 4, 5, 6, 7, 8, 9]}
    />
  )
}

export default Multiplication
