import { motion } from 'framer-motion'

interface ProgressBarProps {
  index: number
  total: number
}

export function ProgressBar({ index, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (index / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs text-violet-300/70">
        <span>
          Question {Math.min(index + 1, total)} of {total}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
