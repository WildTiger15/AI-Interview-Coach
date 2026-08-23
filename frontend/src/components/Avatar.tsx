import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AvatarProps {
  state: AvatarState
  amplitude: number // 0-1, drives mouth openness while speaking
}

const STATE_LABEL: Record<AvatarState, string> = {
  idle: 'Ready when you are',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
}

const RING_COLOR: Record<AvatarState, string> = {
  idle: 'border-violet-400/20',
  listening: 'border-emerald-400/60',
  thinking: 'border-amber-400/50',
  speaking: 'border-fuchsia-400/60',
}

export function Avatar({ state, amplitude }: AvatarProps) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let closeTimeout: ReturnType<typeof setTimeout>
    const scheduleBlink = () => {
      timeout = setTimeout(() => {
        setBlink(true)
        closeTimeout = setTimeout(() => setBlink(false), 130)
        scheduleBlink()
      }, 2200 + Math.random() * 3200)
    }
    scheduleBlink()
    return () => {
      clearTimeout(timeout)
      clearTimeout(closeTimeout)
    }
  }, [])

  const mouthScaleY = state === 'speaking' ? 0.35 + amplitude * 1.6 : 0.18
  const mouthScaleX = state === 'speaking' ? 1 + amplitude * 0.25 : 1

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-56 w-56 items-center justify-center">
        {/* pulsing ring reflecting current state */}
        <motion.div
          className={`absolute h-full w-full rounded-full border-2 ${RING_COLOR[state]}`}
          animate={
            state === 'listening' || state === 'speaking'
              ? { scale: [1, 1.12, 1], opacity: [0.7, 0.15, 0.7] }
              : { scale: 1, opacity: 0.3 }
          }
          transition={{ duration: state === 'speaking' ? 0.9 : 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* head */}
        <motion.div
          animate={{
            y: state === 'idle' ? [0, -5, 0] : 0,
            scale: state === 'thinking' ? [1, 0.985, 1] : 1,
          }}
          transition={{ duration: state === 'idle' ? 4.5 : 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-44 w-44 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, #ffe0cc 0%, #f2a98a 32%, #cf7c93 62%, #7856a8 100%)',
            boxShadow:
              '0 20px 60px rgba(124, 58, 237, 0.35), inset -12px -16px 40px rgba(30,10,40,0.35), inset 10px 12px 28px rgba(255,255,255,0.3)',
          }}
        >
          {/* eyes */}
          <div className="absolute left-1/2 top-[40%] flex w-full -translate-x-1/2 justify-center gap-10">
            <motion.div
              className="h-3.5 w-3.5 rounded-full bg-[#2a1a24]"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.09 }}
            />
            <motion.div
              className="h-3.5 w-3.5 rounded-full bg-[#2a1a24]"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.09 }}
            />
          </div>

          {/* eyebrows, subtle */}
          <div className="absolute left-1/2 top-[33%] flex w-full -translate-x-1/2 justify-center gap-9 opacity-40">
            <div className="h-0.5 w-4 -rotate-6 rounded-full bg-[#2a1a24]" />
            <div className="h-0.5 w-4 rotate-6 rounded-full bg-[#2a1a24]" />
          </div>

          {/* mouth */}
          <motion.div
            className="absolute left-1/2 top-[63%] h-3.5 w-9 -translate-x-1/2 rounded-full bg-[#3a2026]"
            animate={{ scaleY: mouthScaleY, scaleX: mouthScaleX }}
            transition={{ duration: 0.07 }}
          />
        </motion.div>
      </div>

      <motion.p
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-medium tracking-wide text-violet-300/70"
      >
        {STATE_LABEL[state]}
      </motion.p>
    </div>
  )
}
