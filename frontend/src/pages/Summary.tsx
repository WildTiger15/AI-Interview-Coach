import { motion } from 'framer-motion'
import type { SessionState } from '../lib/types'

export function Summary({ session, onRestart }: { session: SessionState; onRestart: () => void }) {
  const avg = session.average_score ?? 0
  const pct = (avg / 5) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="glow -top-10 left-1/2 h-80 w-80 -translate-x-1/2 bg-fuchsia-600" />

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 text-xs font-medium uppercase tracking-wide text-violet-400/70"
      >
        {session.track_label} · Session complete
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-3xl font-semibold text-white sm:text-4xl"
      >
        Here's how you did
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="glass relative mt-8 flex h-40 w-40 items-center justify-center rounded-full"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100) }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <div className="text-3xl font-bold text-white">{avg.toFixed(1)}</div>
          <div className="text-xs text-violet-300/60">out of 5</div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-sm text-violet-200/70"
      >
        {session.questions_answered} questions answered
      </motion.p>

      {!!session.top_improvement_themes?.length && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass mt-8 w-full rounded-2xl p-5 text-left"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-400/70">
            Focus areas for next time
          </p>
          <ul className="space-y-2">
            {session.top_improvement_themes.map((theme, i) => (
              <motion.li
                key={theme}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-2 text-sm text-violet-100/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {theme}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRestart}
        className="mt-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-medium text-white shadow-lg shadow-violet-900/40"
      >
        Try another round
      </motion.button>
    </motion.div>
  )
}
