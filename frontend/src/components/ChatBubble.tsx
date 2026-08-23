import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ChatBubbleProps {
  from: 'coach' | 'user'
  children: ReactNode
}

export function ChatBubble({ from, children }: ChatBubbleProps) {
  const isCoach = from === 'coach'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={
          isCoach
            ? 'glass max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-violet-50'
            : 'max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 py-3 text-sm leading-relaxed text-white shadow-lg shadow-violet-900/30'
        }
      >
        {children}
      </div>
    </motion.div>
  )
}
