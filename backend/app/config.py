"""
Central configuration for the AI Interview Coach backend.

All secrets are read from environment variables (populated from `.env` via
python-dotenv). Nothing sensitive is hardcoded or committed to source control.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
LANGCHAIN_TRACING_V2 = os.environ.get("LANGCHAIN_TRACING_V2", "false")
LANGCHAIN_API_KEY = os.environ.get("LANGCHAIN_API_KEY", "")

# Treat missing/placeholder keys as "no key configured" so the backend can
# fall back to a canned demo mode instead of crashing on every request.
_PLACEHOLDER_MARKERS = ("your-openai-key-here", "place your", "")


def has_openai_key() -> bool:
    key = OPENAI_API_KEY.strip().lower()
    if not key:
        return False
    return not any(marker in key for marker in _PLACEHOLDER_MARKERS if marker)


DEMO_MODE = not has_openai_key()

if LANGCHAIN_TRACING_V2.lower() == "true" and LANGCHAIN_API_KEY:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY
else:
    os.environ["LANGCHAIN_TRACING_V2"] = "false"

if OPENAI_API_KEY:
    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

# Origins allowed to call this API. Always includes the local Vite dev
# server; add production frontend origin(s) via a comma-separated
# FRONTEND_ORIGIN env var, e.g. "https://ai-interview-coach.onrender.com".
_extra_origins = [o.strip() for o in os.environ.get("FRONTEND_ORIGIN", "").split(",") if o.strip()]
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", *_extra_origins]

# Paths
DATA_DIR = BACKEND_DIR / "data" / "knowledge"
DB_PATH = str(BACKEND_DIR / "chroma")

# RAG tuning
SIMILARITY_THRESHOLD = 0.5
QUESTIONS_PER_SESSION = 5

FEEDBACK_PROMPT_TEMPLATE = """You are an expert interview coach. A candidate was asked the
following interview question and gave the answer below. Use the coaching
context (if relevant) to ground your feedback, especially the STAR method.

Coaching context:
{context}

---

Interview question: {question}

Candidate's answer: {answer}

Respond ONLY with compact JSON matching this shape, no markdown fences:
{{
  "score": <integer 1-5>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggested_rewrite": "a short improved version of the answer"
}}
"""

ASK_PROMPT_TEMPLATE = """Given the following interview-coaching context, answer the
question at the end. If the context doesn't cover it, answer from general
interview-coaching best practice instead of refusing.

{context}

---

{question}
"""
