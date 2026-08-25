import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Operation, getFluency, clearFluencyScores } from '../fluency'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const COUNT_OPTIONS = [10, 20, 30, 40, 50]

function fluencyColor(score: number | null): string {
  if (score === null) return ''
  if (score < 0.6) return 'fluency-red'
  if (score < 0.9) return 'fluency-yellow'
  return 'fluency-green'
}

interface Props {
  title: string
  operation: Operation
  exercisePath: string
  defaultDigits: number[]
  startAction?: ReactNode
}

function SelectionPage({ title, operation, exercisePath, defaultDigits, startAction }: Props) {
  const [checked, setChecked] = useState<Set<number>>(
    () => new Set(defaultDigits)
  )
  const [count, setCount] = useState(10)
  const [mode, setMode] = useState<'score' | 'practice'>('score')
  const switchMode = (newMode: 'score' | 'practice') => {
    setMode(newMode)
    setChecked(prev => {
      const next = new Set(prev)
      if (newMode === 'practice') {
        next.add(1)
      } else {
        if (!defaultDigits.includes(1)) next.delete(1)
      }
      return next
    })
  }
  const [, navigate] = useLocation()
  const [, setRefresh] = useState(0)

  const toggleDigit = (d: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  const startPractice = () => {
    const digits = DIGITS.filter(d => checked.has(d))
    if (digits.length === 0) return
    navigate(`${exercisePath}/${digits.join(',')}/${count}`)
  }

  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearScores = () => {
    clearFluencyScores(operation)
    setRefresh(n => n + 1)
    setShowConfirm(false)
  }

  return (
    <div>
      <div className="top-bar">
        <Link href="/" className="btn btn-back">Back</Link>
      </div>
      <h1>{title}</h1>

      <div className="addition-controls">
        <select
          className="addition-select"
          value={count}
          onChange={e => setCount(Number(e.target.value))}
        >
          {COUNT_OPTIONS.map(n => (
            <option key={n} value={n}>{n} problems</option>
          ))}
        </select>
        <button className="btn" onClick={startPractice}>Start Practice</button>
        {startAction}
      </div>

      <div className="addition-controls">
        <div className="mode-toggle">
          <button
            className={`btn ${mode === 'score' ? 'btn-mode-active' : 'btn-mode'}`}
            onClick={() => switchMode('score')}
          >Score</button>
          <button
            className={`btn ${mode === 'practice' ? 'btn-mode-active' : 'btn-mode'}`}
            onClick={() => switchMode('practice')}
          >Learn</button>
        </div>
        {mode === 'score' && (
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Clear Scores</button>
        )}
      </div>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <p>Clear all fluency scores?</p>
            <div className="confirm-actions">
              <button className="btn btn-danger" onClick={handleClearScores}>Clear</button>
              <button className="btn btn-back" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="addition-matrix-wrapper">
        <table className="addition-matrix">
          <thead>
            <tr>
              <th className="addition-corner"></th>
              {DIGITS.map(d => (
                <th key={d} className="addition-col-header">
                  <input
                    type="checkbox"
                    checked={checked.has(d)}
                    onChange={() => toggleDigit(d)}
                  />
                  <span>{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIGITS.map(row => (
              <tr key={row}>
                <td className="addition-row-header">
                  <span>{row}</span>
                </td>
                {DIGITS.map(col => {
                  const isGray = col < row || !checked.has(row) || !checked.has(col)
                  const score = col >= row ? getFluency(operation, row, col) : null
                  const colorClass = isGray ? 'addition-cell-gray' : mode === 'score' ? fluencyColor(score) : ''
                  const opSymbol = operation === 'addition' ? '+' : '×'
                  const [big, small] = col >= row ? [col, row] : [row, col]
                  return (
                    <td
                      key={col}
                      className={`addition-cell ${colorClass}`}
                    >
                      {!isGray
                        ? mode === 'score'
                          ? score !== null ? score.toFixed(2) : ''
                          : `${big}${opSymbol}${small}`
                        : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SelectionPage
