import { useState, useRef } from 'react'
import { Link } from 'wouter'

// ── Constants ────────────────────────────────────────────────────────────────

const MIN = 2
const MAX = 9
const STORAGE_KEY = 'multiplication-random-rt'
const MAX_RT_MS = 10_000

// ── Types ────────────────────────────────────────────────────────────────────

type PairKey = string                          // e.g. "2x5"
type RTStore = Record<PairKey, number | null>  // null = never shown

// ── Helpers ──────────────────────────────────────────────────────────────────

function pairKey(a: number, b: number): PairKey {
  return `${Math.min(a, b)}x${Math.max(a, b)}`
}

function allPairs(): [number, number][] {
  const pairs: [number, number][] = []
  for (let a = MIN; a <= MAX; a++)
    for (let b = a; b <= MAX; b++)
      pairs.push([a, b])
  return pairs
}

function loadStore(): RTStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RTStore
      // ensure every pair is present (handles future schema additions)
      const store: RTStore = {}
      for (const [a, b] of allPairs()) {
        const k = pairKey(a, b)
        store[k] = parsed[k] ?? null
      }
      return store
    }
  } catch { /* ignore */ }
  const store: RTStore = {}
  for (const [a, b] of allPairs())
    store[pairKey(a, b)] = null
  return store
}

function saveStore(store: RTStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

/**
 * Pick the next pair:
 *  1. Randomly from unseen pairs (null RT), skipping `skipKey` to avoid
 *     showing the same pair twice in a row.
 *  2. Once all pairs are seen, weighted-random by reaction time
 *     (slower RT → picked more often).
 */
function pickNext(store: RTStore, skipKey?: PairKey): [number, number] {
  const pairs = allPairs()
  const unseen = pairs.filter(
    ([a, b]) => store[pairKey(a, b)] === null && pairKey(a, b) !== skipKey
  )

  if (unseen.length > 0) {
    return unseen[Math.floor(Math.random() * unseen.length)]
  }

  // All seen — weighted by e^(reaction_time) for stronger skew toward slow pairs
  const candidates = pairs.filter(([a, b]) => pairKey(a, b) !== skipKey)
  const weights = candidates.map(([a, b]) => Math.exp((store[pairKey(a, b)] ?? 0) / 1000))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

/**
 * Update reaction time using EMA: 0.8 * new + 0.1 * old, capped at MAX_RT_MS.
 * First observation is stored as-is.
 */
function updateRT(store: RTStore, a: number, b: number, elapsedMs: number): RTStore {
  const key = pairKey(a, b)
  const capped = Math.min(elapsedMs, MAX_RT_MS)
  const old = store[key]
  const updated = old === null ? capped : 0.8 * capped + 0.1 * old
  return { ...store, [key]: Math.min(updated, MAX_RT_MS) }
}

// ── Components ───────────────────────────────────────────────────────────────

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div className="die-scene" aria-label={`Die showing ${value}`}>
      <div className={`die-cube ${rolling ? 'die-rolling' : ''}`}>
        <div className="die-face die-face--front">{value}</div>
        <div className="die-face die-face--back">·</div>
        <div className="die-face die-face--left">·</div>
        <div className="die-face die-face--right">·</div>
        <div className="die-face die-face--top">·</div>
        <div className="die-face die-face--bottom">·</div>
      </div>
    </div>
  )
}

function MultiplicationRandom() {
  const [store, setStore] = useState<RTStore>(loadStore)
  const [current, setCurrent] = useState<[number, number]>(() => pickNext(loadStore()))
  const [rolling, setRolling] = useState(false)

  // Tracks when the current pair was displayed — used to compute reaction time
  const shownAt = useRef<number>(Date.now())

  const clear = () => {
    const blank: RTStore = {}
    for (const [a, b] of allPairs()) blank[pairKey(a, b)] = null
    saveStore(blank)
    setStore(blank)
    setCurrent(pickNext(blank))
    shownAt.current = Date.now()
  }

  const roll = () => {
    if (rolling) return

    // Measure elapsed time since this pair was shown
    const elapsed = Date.now() - shownAt.current
    const [a, b] = current
    const newStore = updateRT(store, a, b, elapsed)
    saveStore(newStore)
    setStore(newStore)

    // Pick next pair, skipping current to avoid immediate repeat
    const next = pickNext(newStore, pairKey(a, b))

    setRolling(true)
    window.setTimeout(() => {
      setCurrent(next)
      setRolling(false)
      shownAt.current = Date.now() // restart timer when new pair appears
    }, 600)
  }

  return (
    <div>
      <div className="top-bar">
        <Link href="/multiplication" className="btn btn-back">Back</Link>
        <button className="btn btn-danger top-bar-clear" onClick={clear}>Clear</button>
      </div>
      <main className="random-dice-screen">
        <h1>Random Multiplication</h1>
        <div className="dice" aria-live="polite">
          <Die value={current[0]} rolling={rolling} />
          <Die value={current[1]} rolling={rolling} />
        </div>
        <button className="btn dice-roll-button" onClick={roll} disabled={rolling}>
          🎲 Roll
        </button>
      </main>
    </div>
  )
}

export default MultiplicationRandom
