import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams } from 'wouter'
import confetti from 'canvas-confetti'
import { Operation, getFluency, updateFluency, calculateTestScore } from '../fluency'

interface Problem {
  a: number
  b: number
}

function generateProblems(op: Operation, digits: number[], count: number): Problem[] {
  const pool: Problem[] = []
  for (const row of digits) {
    for (const col of digits) {
      if (col >= row) {
        pool.push({ a: row, b: col })
      }
    }
  }

  pool.sort((a, b) => {
    const sa = getFluency(op, a.a, a.b)
    const sb = getFluency(op, b.a, b.b)
    const va = sa === null ? -1 : sa
    const vb = sb === null ? -1 : sb
    return va - vb
  })

  const selected = pool.slice(0, Math.min(count, pool.length))
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]]
  }
  return selected
}

function computeAnswer(op: Operation, a: number, b: number): number {
  return op === 'addition' ? a + b : a * b
}

function operatorSymbol(op: Operation): string {
  return op === 'addition' ? '+' : '×'
}

interface Props {
  operation: Operation
  backPath: string
}

function ExercisePage({ operation, backPath }: Props) {
  const params = useParams<{ digits: string; count: string }>()
  const digits = useMemo(() => params.digits.split(',').map(Number), [params.digits])
  const count = Number(params.count)

  const [problems, setProblems] = useState<Problem[]>(() => generateProblems(operation, digits, count))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [showCorrect, setShowCorrect] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [hadWrong, setHadWrong] = useState(false)
  const [questionStart, setQuestionStart] = useState(() => Date.now())
  const [done, setDone] = useState(false)

  const problem = done ? null : problems[currentIndex]
  const expected = problem ? computeAnswer(operation, problem.a, problem.b) : 0

  const advance = useCallback(() => {
    if (currentIndex + 1 < problems.length) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setShowCorrect(false)
      setWrong(false)
      setHadWrong(false)
      setQuestionStart(Date.now())
    } else {
      setDone(true)
    }
  }, [currentIndex, problems.length])

  const pressDigit = useCallback((d: number) => {
    if (showCorrect || done) return
    setWrong(false)
    const next = answer + String(d)
    const numAnswer = parseInt(next)
    setAnswer(next)

    if (numAnswer === expected) {
      const timeMs = Date.now() - questionStart
      const testScore = calculateTestScore(timeMs, hadWrong)
      updateFluency(operation, problems[currentIndex].a, problems[currentIndex].b, testScore)
      setCorrectCount(c => c + (hadWrong ? 0 : 1))
      setShowCorrect(true)
    } else if (next.length >= String(expected).length) {
      setWrong(true)
      setHadWrong(true)
    }
  }, [answer, showCorrect, done, expected, problems, currentIndex, questionStart, hadWrong, operation])

  const pressBackspace = useCallback(() => {
    if (showCorrect || done) return
    setWrong(false)
    setAnswer(prev => prev.slice(0, -1))
  }, [showCorrect, done])

  useEffect(() => {
    if (!showCorrect) return
    const timer = setTimeout(advance, 800)
    return () => clearTimeout(timer)
  }, [showCorrect, advance])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') pressDigit(parseInt(e.key))
      if (e.key === 'Backspace') pressBackspace()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pressDigit, pressBackspace])

  const restart = () => {
    setProblems(generateProblems(operation, digits, count))
    setCurrentIndex(0)
    setAnswer('')
    setCorrectCount(0)
    setShowCorrect(false)
    setWrong(false)
    setHadWrong(false)
    setQuestionStart(Date.now())
    setDone(false)
  }

  const allCorrect = done && correctCount === problems.length

  useEffect(() => {
    if (allCorrect) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    }
  }, [allCorrect])

  if (done) {
    return (
      <div>
        <div className="top-bar">
          <Link href={backPath} className="btn btn-back">Back</Link>
        </div>
        <div className="summary">
          <h2>Results</h2>
          <p className="summary-score">{allCorrect ? 'Perfect! ' : ''}{correctCount} / {problems.length} correct</p>
          <div className="summary-actions">
            <button className="btn" onClick={restart}>Another Session</button>
          </div>
        </div>
      </div>
    )
  }

  const answerColor = showCorrect ? 'answer-correct' : wrong ? 'answer-wrong' : ''

  return (
    <div>
      <div className="top-bar">
        <Link href={backPath} className="btn btn-back">Back</Link>
      </div>
      <div className="exercise-screen">
        <div className="exercise-progress">
          {currentIndex + 1} / {problems.length}
        </div>
        <div className="exercise-prompt">
          {problem!.a} {operatorSymbol(operation)} {problem!.b} = <span className={`exercise-answer ${answerColor}`}>{answer || ' '}</span>
        </div>

        <div className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button key={d} className="numpad-btn" onClick={() => pressDigit(d)}>{d}</button>
          ))}
          <button className="numpad-btn numpad-backspace" onClick={pressBackspace}>&#9003;</button>
          <button className="numpad-btn" onClick={() => pressDigit(0)}>0</button>
          <div className="numpad-spacer" />
        </div>
      </div>
    </div>
  )
}

export default ExercisePage
