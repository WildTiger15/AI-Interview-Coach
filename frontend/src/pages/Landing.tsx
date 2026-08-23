import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Track } from '../lib/types'

const TRACKS: { id: Track; label: string; blurb: string; emoji: string }[] = [
  { id: 'software-engineer', label: 'Software Engineer', blurb: 'Behavioral + technical-round style questions', emoji: '💻' },
  { id: 'product-manager', label: 'Product Manager', blurb: 'Prioritization, launches, stakeholder alignment', emoji: '🧭' },
  { id: 'general', label: 'General / Behavioral', blurb: 'Works for any role — classic behavioral questions', emoji: '🎯' },
]

export function Landing({ onStart }: { onStart: (track: Track) => void }) {
  const [selected, setSelected] = useState<Track>('general')
  const [demoMode, setDemoMode] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .health()
      .then((h) => setDemoMode(h.demo_mode))
      .catch(() => setDemoMode(null))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="glow -top-20 left-1/2 h-72 w-72 -translate-x-1/2 bg-violet-600" />

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1 text-xs font-medium tracking-wide text-violet-300"
      >
        AI-powered mock interviews
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
      >
        Practice interviews.
        <br />
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Get real feedback.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 max-w-lg text-violet-200/70"
      >
        Pick a track, answer real interview questions, and get instant coaching
        grounded in the STAR method — strengths, gaps, and a stronger rewrite
        for every answer.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-10 grid w-full gap-3 sm:grid-cols-3"
      >
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`glass rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-400/40 ${
              selected === t.id ? 'ring-2 ring-violet-400/70' : ''
            }`}
          >
            <div className="mb-2 text-2xl">{t.emoji}</div>
            <div className="font-medium text-white">{t.label}</div>
            <div className="mt-1 text-xs text-violet-300/60">{t.blurb}</div>
          </button>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart(selected)}
        className="mt-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-medium text-white shadow-lg shadow-violet-900/40"
      >
        Start mock interview →
      </motion.button>

      {demoMode !== null && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xs text-violet-400/60"
        >
          {demoMode
            ? 'Backend is running in demo mode (no OpenAI key configured) — you\'ll see sample feedback.'
            : 'Connected to a live OpenAI-backed coach.'}
        </motion.p>
      )}
    </motion.div>
  )
}
