import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="glass flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot h-2 w-2 rounded-full bg-violet-300"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </motion.div>
  )
}
