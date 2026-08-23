import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from './api'

const FEMALE_VOICE_HINTS =
  /female|zira|jenny|aria|samantha|susan|victoria|karen|moira|tessa|fiona|salli|joanna|kimberly|ivy|kendra|nicole|amy|emma|olivia|ava|allison|hazel|shimmer|nova/i
const MALE_VOICE_HINTS = /male|david|mark|guy|daniel|fred|george|james|thomas|alex\b|onyx|echo/i

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length) {
      resolve(existing)
      return
    }
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    // Some browsers never fire voiceschanged if voices are already cached elsewhere.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500)
  })
}

async function pickFemaleVoice(): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await getVoicesAsync()
  if (!voices.length) return undefined

  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const pool = english.length ? english : voices

  return (
    pool.find((v) => FEMALE_VOICE_HINTS.test(v.name)) ??
    pool.find((v) => !MALE_VOICE_HINTS.test(v.name)) ??
    pool[0]
  )
}

/**
 * Speaks text aloud using the backend's OpenAI TTS endpoint, analyzing the
 * live audio to drive avatar mouth animation. Falls back to the browser's
 * built-in speechSynthesis (with a synthetic amplitude pulse) when the
 * backend TTS is unavailable (demo mode, network error, etc).
 *
 * `speak()` resolves once playback finishes, so callers can await it to
 * avoid overlapping utterances (e.g. feedback, then the next question).
 */
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [amplitude, setAmplitude] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopAnalysis = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setAmplitude(0)
  }, [])

  const cancel = useCallback(() => {
    audioRef.current?.pause()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
    stopAnalysis()
  }, [stopAnalysis])

  const speakWithBrowser = useCallback(
    async (text: string) => {
      if (!('speechSynthesis' in window)) return

      const voice = await pickFemaleVoice()

      await new Promise<void>((resolve) => {
        const utter = new SpeechSynthesisUtterance(text)
        if (voice) utter.voice = voice
        utter.pitch = 1.05
        setSpeaking(true)

        const pulse = () => {
          setAmplitude(0.25 + Math.random() * 0.55)
          rafRef.current = requestAnimationFrame(pulse)
        }
        pulse()

        const finish = () => {
          setSpeaking(false)
          stopAnalysis()
          resolve()
        }
        utter.onend = finish
        utter.onerror = finish
        window.speechSynthesis.speak(utter)
      })
    },
    [stopAnalysis],
  )

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      try {
        const res = await fetch(`${API_BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed }),
        })
        if (!res.ok) throw new Error('backend tts unavailable')

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio

        const AudioCtxCtor =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = audioCtxRef.current ?? new AudioCtxCtor()
        audioCtxRef.current = ctx

        const source = ctx.createMediaElementSource(audio)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyser.connect(ctx.destination)
        const data = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
          analyser.getByteFrequencyData(data)
          const avg = data.reduce((a, b) => a + b, 0) / data.length
          setAmplitude(Math.min(1, avg / 90))
          rafRef.current = requestAnimationFrame(tick)
        }

        await new Promise<void>((resolve) => {
          setSpeaking(true)
          const finish = () => {
            setSpeaking(false)
            stopAnalysis()
            URL.revokeObjectURL(url)
            resolve()
          }
          audio.onended = finish
          audio.onerror = finish

          Promise.resolve(ctx.state === 'suspended' ? ctx.resume() : undefined)
            .then(() => audio.play())
            .then(tick)
            .catch(finish)
        })
      } catch {
        await speakWithBrowser(trimmed)
      }
    },
    [speakWithBrowser, stopAnalysis],
  )

  return { speak, cancel, speaking, amplitude }
}
