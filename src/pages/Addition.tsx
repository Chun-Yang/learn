import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { getFluency, clearFluencyScores } from '../fluency'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const COUNT_OPTIONS = [10, 20, 30, 40, 50]

function fluencyColor(score: number | null): string {
  if (score === null) return ''
  if (score < 0.6) return 'fluency-red'
  if (score < 0.9) return 'fluency-yellow'
  return 'fluency-green'
}

function Addition() {
  const [checked, setChecked] = useState<Set<number>>(
    () => new Set([2, 3, 4, 5, 6, 7, 8])
  )
  const [count, setCount] = useState(10)
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
    navigate(`/addition-exercise/${digits.join(',')}/${count}`)
  }

  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearScores = () => {
    clearFluencyScores()
    setRefresh(n => n + 1)
    setShowConfirm(false)
  }

  return (
    <div>
      <div className="top-bar">
        <Link href="/" className="btn btn-back">Back</Link>
      </div>
      <h1>Single Digit Addition</h1>

      <div className="addition-controls">
        <button className="btn" onClick={startPractice}>Start Practice</button>
        <select
          className="addition-select"
          value={count}
          onChange={e => setCount(Number(e.target.value))}
        >
          {COUNT_OPTIONS.map(n => (
            <option key={n} value={n}>{n} problems</option>
          ))}
        </select>
        <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Clear Scores</button>
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
                  const score = col >= row ? getFluency(row, col) : null
                  const colorClass = isGray ? 'addition-cell-gray' : fluencyColor(score)
                  return (
                    <td
                      key={col}
                      className={`addition-cell ${colorClass}`}
                    >
                      {!isGray && score !== null ? score.toFixed(2) : ''}
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

export default Addition
