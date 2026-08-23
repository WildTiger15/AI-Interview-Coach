import { motion } from 'framer-motion'
import type { Feedback } from '../lib/types'

const SCORE_COLORS: Record<number, string> = {
  1: 'from-rose-500 to-orange-500',
  2: 'from-orange-500 to-amber-500',
  3: 'from-amber-400 to-yellow-300',
  4: 'from-lime-400 to-emerald-400',
  5: 'from-emerald-400 to-teal-300',
}

export function ScoreCard({ feedback }: { feedback: Feedback }) {
  const gradient = SCORE_COLORS[feedback.score] ?? SCORE_COLORS[3]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
      className="glass w-full max-w-[85%] rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-black/80 shadow-lg`}
        >
          {feedback.score}/5
        </motion.div>
        <p className="text-sm font-medium text-violet-100">
          Coach feedback {feedback.demo_mode && <span className="text-violet-400/70">(demo mode)</span>}
        </p>
      </div>

      {feedback.error && (
        <p className="mb-2 text-xs text-amber-300/90">{feedback.error}</p>
      )}

      <FeedbackList label="Strengths" items={feedback.strengths} dotClass="bg-emerald-400" delay={0.25} />
      <FeedbackList label="Try improving" items={feedback.improvements} dotClass="bg-amber-400" delay={0.35} />

      {feedback.suggested_rewrite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs italic text-violet-200/80"
        >
          "{feedback.suggested_rewrite}"
        </motion.div>
      )}
    </motion.div>
  )
}

function FeedbackList({
  label,
  items,
  dotClass,
  delay,
}: {
  label: string
  items: string[]
  dotClass: string
  delay: number
}) {
  if (!items?.length) return null
  return (
    <div className="mb-2">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-400/70">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.08 }}
            className="flex items-start gap-2 text-sm text-violet-100/90"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
