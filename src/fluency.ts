const STORAGE_KEY = 'addition-fluency'

type FluencyMap = Record<string, number>

function getKey(a: number, b: number): string {
  return `${Math.min(a, b)},${Math.max(a, b)}`
}

export function getFluencyScores(): FluencyMap {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function getFluency(a: number, b: number): number | null {
  const scores = getFluencyScores()
  const key = getKey(a, b)
  return key in scores ? scores[key] : null
}

export function updateFluency(a: number, b: number, testScore: number): void {
  const scores = getFluencyScores()
  const key = getKey(a, b)
  if (key in scores) {
    scores[key] = scores[key] * 0.8 + testScore * 0.2
  } else {
    scores[key] = testScore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function clearFluencyScores(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function calculateTestScore(timeMs: number, wasWrong: boolean): number {
  if (wasWrong) return 0
  const timeSec = timeMs / 1000
  if (timeSec <= 3) return 1
  if (timeSec >= 10) return 0
  return (10 - timeSec) / 7
}
