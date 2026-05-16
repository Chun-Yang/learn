export type Operation = 'addition' | 'multiplication'

type FluencyMap = Record<string, number>

function storageKey(op: Operation): string {
  return `${op}-fluency`
}

function getKey(a: number, b: number): string {
  return `${Math.min(a, b)},${Math.max(a, b)}`
}

export function getFluencyScores(op: Operation): FluencyMap {
  const raw = localStorage.getItem(storageKey(op))
  return raw ? JSON.parse(raw) : {}
}

export function getFluency(op: Operation, a: number, b: number): number | null {
  const scores = getFluencyScores(op)
  const key = getKey(a, b)
  return key in scores ? scores[key] : null
}

export function updateFluency(op: Operation, a: number, b: number, testScore: number): void {
  const scores = getFluencyScores(op)
  const key = getKey(a, b)
  if (key in scores) {
    scores[key] = scores[key] * 0.8 + testScore * 0.2
  } else {
    scores[key] = testScore
  }
  localStorage.setItem(storageKey(op), JSON.stringify(scores))
}

export function clearFluencyScores(op: Operation): void {
  localStorage.removeItem(storageKey(op))
}

export function calculateTestScore(timeMs: number, wasWrong: boolean): number {
  if (wasWrong) return 0
  const timeSec = timeMs / 1000
  if (timeSec <= 3) return 1
  if (timeSec >= 10) return 0
  return (10 - timeSec) / 7
}
