# Deploying to Render

This repo includes [render.yaml](render.yaml), a Blueprint that provisions
both services (FastAPI backend + static React frontend) from one repo. Both
env-var values in it are intentionally blank because of a chicken-and-egg
problem: each service needs the other's URL, and neither URL exists until
you create it. Two passes fixes that.

## 1. Push this repo to your own GitHub
This project's `origin` remote already points at your own
`github.com/WildTiger15/AI-Interview-Coach` — if that's correct, just:
```bash
git add -A
git commit -m "Rebuild as AI Interview Coach: FastAPI + LangChain backend, animated voice-enabled React frontend"
git push origin main
```
(I won't push without you asking — say the word and I'll run this for you.)

## 2. Create the Render Blueprint
1. Sign in at [render.com](https://render.com) (GitHub login is easiest).
2. **New** → **Blueprint** → connect this GitHub repo. Render reads
   `render.yaml` and proposes both services — accept.
3. It will fail to fully deploy yet because of the blank env vars below —
   that's expected on the first pass.

## 3. Set the backend's secret and CORS origin
On the **ai-interview-coach-api** service → **Environment**:
- `OPENAI_API_KEY` → paste your real key (never commit this anywhere).
- `FRONTEND_ORIGIN` → the static site's URL from step 2, e.g.
  `https://ai-interview-coach.onrender.com` (check the frontend service's
  page for its actual assigned URL — Render may have added a suffix).

Save → this triggers a redeploy of the backend.

## 4. Point the frontend at the backend
On the **ai-interview-coach** (static site) service → **Environment**:
- `VITE_API_BASE_URL` → the backend service's URL, e.g.
  `https://ai-interview-coach-api.onrender.com` (no trailing slash).

Save → this triggers a rebuild of the frontend (Vite env vars are baked in
at build time, so this step must re-run the build).

## 5. Verify
Open the frontend URL. The landing page's footer note should say
"Connected to a live OpenAI-backed coach" (not demo mode) once both env
vars are set correctly and both services have redeployed.

## Notes / limitations for this free-tier setup
- **Cold starts**: Render's free web services spin down after ~15 minutes
  idle and take ~30-60s to wake on the next request — expect a slow first
  response after inactivity.
- **In-memory sessions**: mock-interview session state lives in the
  backend's process memory ([backend/app/interview.py](backend/app/interview.py)).
  A cold-start restart clears any in-progress sessions. Fine for a demo;
  would need a real datastore (Redis/Postgres) for anything persistent.
- **Chroma index**: built once at deploy time from
  `backend/data/knowledge/*.md` via the build command. Render's free disk
  is ephemeral, but since it's rebuilt on every deploy, that's fine — just
  know a manual dashboard restart (not a redeploy) won't rebuild it.
