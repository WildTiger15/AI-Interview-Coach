# AI Interview Coach

A mock-interview coach: pick a track, talk to an animated AI coach out loud,
and get instant STAR-method feedback — backed by a FastAPI + LangChain RAG
service and a React + Tailwind + Framer Motion animated demo UI with real
voice input/output.

Originally forked from `quick-rag` (a terminal RAG chatbot); this rebuild
adds a proper backend API, real interview content, session state, a
mock-interview flow, and a full animated frontend.

## Project structure
```
backend/            FastAPI service + LangChain/Chroma RAG
  app/               API routes, config, interview logic, question bank
  data/knowledge/    Interview-coaching source docs (STAR method, tips, etc.)
  scripts/           Index-building script
frontend/            Vite + React + TypeScript + Tailwind + Framer Motion
```

## Running it

### 1. Backend
```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # then add your real OPENAI_API_KEY
python -m scripts.build_index # optional: builds the RAG index (needs a real key)
uvicorn app.main:app --reload --port 8000
```
Without a real `OPENAI_API_KEY`, the backend still runs — it serves clearly
labeled canned "demo mode" feedback so the UI is fully explorable without
API costs.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The Vite dev server proxies `/api` to the
backend on port 8000.

## How it works
- **Mock interview**: `POST /api/session` starts a session for a track
  (Software Engineer / Product Manager / General) and returns the first of
  5 curated questions. `POST /api/session/{id}/answer` scores the answer
  (1-5), lists strengths/improvements, and suggests a rewrite — grounded in
  the STAR-method knowledge base via retrieval when a real key is
  configured. After the last question, the session returns a summary with
  an average score and recurring improvement themes.
- **Open Q&A** (`POST /api/ask`): the original repo's general RAG chatbot
  behavior, preserved as a secondary mode over the same knowledge base.
- **RAG index**: `backend/data/knowledge/*.md` is chunked and embedded into
  a local Chroma DB (`backend/chroma/`, gitignored) by
  `scripts/build_index.py`.

## Voice
- **Speech input**: tap the mic button to dictate your answer via the
  browser's built-in speech recognition (Chrome/Edge). Falls back to typing
  if unsupported.
- **Speech output**: the AI coach speaks every question and feedback aloud.
  With a real `OPENAI_API_KEY`, this uses OpenAI TTS (`POST /api/tts`,
  natural-sounding voice); without one, it falls back to the browser's
  built-in speech synthesis automatically.
- **Animated avatar**: a reactive face (`frontend/src/components/Avatar.tsx`)
  blinks, idles, and opens/closes its mouth in sync with live audio
  amplitude while speaking, and shows distinct listening/thinking/speaking
  states.

## Deploying
See [DEPLOY.md](DEPLOY.md) for hosting this on Render (a `render.yaml`
Blueprint provisions both the backend API and the static frontend from this
repo).

## Notes
- No secrets are committed — `backend/.env` is gitignored; use
  `backend/.env.example` as the template.
- `backend/chroma/`, `frontend/node_modules/`, and `frontend/dist/` are
  gitignored build/data artifacts.
