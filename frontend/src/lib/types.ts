export type Track = 'software-engineer' | 'product-manager' | 'general'

export interface Feedback {
  score: number
  strengths: string[]
  improvements: string[]
  suggested_rewrite: string
  demo_mode?: boolean
  error?: string
}

export interface SessionState {
  session_id: string
  finished: boolean
  track: Track
  track_label: string
  // in-progress fields
  question?: string
  index?: number
  total?: number
  // finished fields
  average_score?: number
  questions_answered?: number
  top_improvement_themes?: string[]
  transcript?: {
    question: string
    answer: string | null
    feedback: Feedback | null
  }[]
}

export interface AnswerResponse extends SessionState {
  feedback: Feedback
}

export interface HealthResponse {
  status: string
  demo_mode: boolean
  tracks: Record<Track, string>
}
