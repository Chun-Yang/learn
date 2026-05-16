import SelectionPage from './SelectionPage'

function Addition() {
  return (
    <SelectionPage
      title="Single Digit Addition"
      operation="addition"
      exercisePath="/addition-exercise"
      defaultDigits={[2, 3, 4, 5, 6, 7, 8]}
    />
  )
}

export default Addition
