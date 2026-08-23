import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Interview } from './pages/Interview'
import { Landing } from './pages/Landing'
import { Summary } from './pages/Summary'
import { api } from './lib/api'
import type { SessionState, Track } from './lib/types'

type Screen = { name: 'landing' } | { name: 'interview'; session: SessionState } | { name: 'summary'; session: SessionState }

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'landing' })
  const [error, setError] = useState<string | null>(null)

  async function handleStart(track: Track) {
    setError(null)
    try {
      const session = await api.startSession(track)
      setScreen({ name: 'interview', session })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen">
      {error && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-rose-500/90 px-4 py-2 text-sm text-white shadow-lg">
          Couldn't reach the backend: {error}. Is it running on port 8000?
        </div>
      )}
      <AnimatePresence mode="wait">
        {screen.name === 'landing' && <Landing key="landing" onStart={handleStart} />}
        {screen.name === 'interview' && (
          <Interview
            key="interview"
            session={screen.session}
            onFinished={(final) => setScreen({ name: 'summary', session: final })}
          />
        )}
        {screen.name === 'summary' && (
          <Summary key="summary" session={screen.session} onRestart={() => setScreen({ name: 'landing' })} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
