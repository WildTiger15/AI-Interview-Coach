import type { AnswerResponse, HealthResponse, SessionState, Track } from './types'

// In dev, this is empty and Vite's proxy forwards /api to localhost:8000.
// In production (e.g. a static site on Render), set VITE_API_BASE_URL to the
// deployed backend's full origin, e.g. https://ai-interview-coach-api.onrender.com
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<HealthResponse>('/health'),

  startSession: (track: Track) =>
    request<SessionState>('/session', {
      method: 'POST',
      body: JSON.stringify({ track }),
    }),

  submitAnswer: (sessionId: string, answer: string) =>
    request<AnswerResponse>(`/session/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),

  ask: (question: string) =>
    request<{ answer: string; demo_mode: boolean }>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
}
