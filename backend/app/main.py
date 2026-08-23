from __future__ import annotations

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import config, interview, rag
from .question_bank import TRACK_LABELS

app = FastAPI(title="AI Interview Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartSessionRequest(BaseModel):
    track: str = "general"


class AnswerRequest(BaseModel):
    answer: str


class AskRequest(BaseModel):
    question: str


class TTSRequest(BaseModel):
    text: str
    voice: str = "shimmer"


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "demo_mode": config.DEMO_MODE,
        "tracks": TRACK_LABELS,
    }


@app.post("/api/session")
def start_session(body: StartSessionRequest):
    session = interview.create_session(body.track)
    return interview.session_public_state(session)


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = interview.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return interview.session_public_state(session)


@app.post("/api/session/{session_id}/answer")
def answer_session(session_id: str, body: AnswerRequest):
    session = interview.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.finished:
        raise HTTPException(status_code=400, detail="Session already finished")
    if not body.answer.strip():
        raise HTTPException(status_code=422, detail="Answer cannot be empty")

    feedback = interview.submit_answer(session, body.answer)
    state = interview.session_public_state(session)
    return {"feedback": feedback, **state}


@app.post("/api/ask")
def ask(body: AskRequest):
    """Open Q&A mode, preserving the original repo's general-purpose RAG chatbot."""
    if not body.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty")

    if config.DEMO_MODE:
        return {
            "answer": (
                "Demo mode is active (no OPENAI_API_KEY configured), so here's a "
                "canned tip instead of a live answer: use the STAR method — "
                "Situation, Task, Action, Result — for any 'tell me about a time' "
                "question."
            ),
            "demo_mode": True,
        }

    from langchain_openai import ChatOpenAI
    from langchain.prompts import ChatPromptTemplate

    context = rag.retrieve_context(body.question)
    prompt = ChatPromptTemplate.from_template(config.ASK_PROMPT_TEMPLATE).format(
        context=context or "(no specific context found)", question=body.question
    )
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
    response = model.invoke(prompt)
    return {"answer": response.content, "demo_mode": False}


_ALLOWED_VOICES = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}


@app.post("/api/tts")
def text_to_speech(body: TTSRequest):
    """Speak `text` aloud via OpenAI TTS. Unavailable in demo mode — the
    frontend falls back to the browser's built-in speech synthesis when this
    404s/503s."""
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text cannot be empty")
    if config.DEMO_MODE:
        raise HTTPException(status_code=503, detail="TTS unavailable in demo mode (no OPENAI_API_KEY configured)")

    voice = body.voice if body.voice in _ALLOWED_VOICES else "shimmer"

    from openai import OpenAI

    client = OpenAI(api_key=config.OPENAI_API_KEY)

    # gpt-4o-mini-tts supports natural-language style direction and is the
    # most human-sounding option; fall back to the older tts-1 models if it's
    # unavailable on the account (older API keys/orgs) or errors out.
    attempts = [
        dict(
            model="gpt-4o-mini-tts",
            voice=voice,
            input=text[:2000],
            instructions=(
                "Speak like a warm, encouraging human interview coach having a "
                "real conversation: natural pacing, relaxed and conversational, "
                "not robotic or overly formal. Light, genuine enthusiasm."
            ),
        ),
        dict(model="tts-1-hd", voice=voice, input=text[:2000]),
        dict(model="tts-1", voice=voice, input=text[:2000]),
    ]

    last_error: Exception | None = None
    for kwargs in attempts:
        try:
            speech = client.audio.speech.create(**kwargs)
            return Response(content=speech.read(), media_type="audio/mpeg")
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue

    raise HTTPException(status_code=502, detail=f"TTS request failed: {last_error}")
