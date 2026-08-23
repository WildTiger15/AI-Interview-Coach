import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Avatar, type AvatarState } from '../components/Avatar'
import { ChatBubble } from '../components/ChatBubble'
import { ProgressBar } from '../components/ProgressBar'
import { ScoreCard } from '../components/ScoreCard'
import { api } from '../lib/api'
import { useSpeechRecognition } from '../lib/useSpeechRecognition'
import { useTextToSpeech } from '../lib/useTextToSpeech'
import type { Feedback, SessionState } from '../lib/types'

interface Message {
  id: string
  from: 'coach' | 'user'
  kind: 'text' | 'feedback'
  text?: string
  feedback?: Feedback
}

function spokenFeedback(feedback: Feedback): string {
  const parts = [`I'd give that a ${feedback.score} out of 5.`]
  if (feedback.strengths?.[0]) parts.push(`Nice work: ${feedback.strengths[0]}`)
  if (feedback.improvements?.[0]) parts.push(`One thing to work on: ${feedback.improvements[0]}`)
  return parts.join(' ')
}

export function Interview({
  session,
  onFinished,
}: {
  session: SessionState
  onFinished: (final: SessionState) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'q0', from: 'coach', kind: 'text', text: session.question },
  ])
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [index, setIndex] = useState(session.index ?? 0)
  const [total] = useState(session.total ?? 1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasSpokenFirstQuestion = useRef(false)

  const { speak, speaking, amplitude } = useTextToSpeech()
  const { transcript, listening, supported: micSupported, start: startMic, stop: stopMic } =
    useSpeechRecognition()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, submitting])

  // Keep the answer box in sync with live speech-to-text while the mic is on.
  useEffect(() => {
    if (listening) setAnswer(transcript)
  }, [transcript, listening])

  // Speak the opening question once, on mount.
  useEffect(() => {
    if (hasSpokenFirstQuestion.current) return
    hasSpokenFirstQuestion.current = true
    if (session.question) void speak(session.question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const avatarState: AvatarState = submitting ? 'thinking' : speaking ? 'speaking' : listening ? 'listening' : 'idle'

  function toggleMic() {
    if (listening) {
      stopMic()
    } else {
      setAnswer('')
      startMic()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = answer.trim()
    if (!trimmed || submitting) return

    if (listening) stopMic()

    setMessages((m) => [...m, { id: crypto.randomUUID(), from: 'user', kind: 'text', text: trimmed }])
    setAnswer('')
    setSubmitting(true)

    try {
      const res = await api.submitAnswer(session.session_id, trimmed)
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: 'coach', kind: 'feedback', feedback: res.feedback },
      ])
      setSubmitting(false)

      await speak(spokenFeedback(res.feedback))

      if (res.finished) {
        onFinished(res)
      } else {
        setIndex(res.index ?? index + 1)
        setMessages((m) => [...m, { id: crypto.randomUUID(), from: 'coach', kind: 'text', text: res.question }])
        if (res.question) await speak(res.question)
      }
    } catch (err) {
      setSubmitting(false)
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          from: 'coach',
          kind: 'text',
          text: `Something went wrong reaching the coach: ${(err as Error).message}`,
        },
      ])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8"
    >
      <div className="mb-4 flex justify-center">
        <Avatar state={avatarState} amplitude={amplitude} />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-400/70">
          {session.track_label}
        </p>
        <ProgressBar index={index} total={total} />
      </div>

      <div className="thin-scroll flex-1 space-y-4 overflow-y-auto pb-4">
        <AnimatePresence initial={false}>
          {messages.map((m) =>
            m.kind === 'feedback' && m.feedback ? (
              <ScoreCard key={m.id} feedback={m.feedback} />
            ) : (
              <ChatBubble key={m.id} from={m.from}>
                {m.text}
              </ChatBubble>
            ),
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="glass sticky bottom-4 flex items-end gap-2 rounded-2xl p-2">
        <motion.button
          type="button"
          onClick={toggleMic}
          disabled={!micSupported || submitting}
          whileHover={{ scale: micSupported ? 1.05 : 1 }}
          whileTap={{ scale: micSupported ? 0.95 : 1 }}
          title={micSupported ? (listening ? 'Stop listening' : 'Speak your answer') : 'Speech recognition not supported in this browser'}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-30 ${
            listening ? 'bg-rose-500/90 text-white' : 'bg-white/10 text-violet-200 hover:bg-white/15'
          }`}
        >
          {listening ? <StopIcon /> : <MicIcon />}
        </motion.button>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder={listening ? 'Listening… speak your answer' : 'Type your answer, or tap the mic to speak…'}
          rows={2}
          disabled={submitting}
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-violet-50 placeholder-violet-400/40 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={submitting || !answer.trim()}
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  )
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
      <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  )
}
