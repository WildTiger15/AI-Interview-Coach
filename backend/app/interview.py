"""Mock-interview session state machine and LLM-backed feedback generation."""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from typing import Any

from . import config, rag
from .question_bank import TRACK_LABELS, pick_questions

_SESSIONS: dict[str, "Session"] = {}


@dataclass
class Turn:
    question: str
    answer: str | None = None
    feedback: dict[str, Any] | None = None


@dataclass
class Session:
    id: str
    track: str
    turns: list[Turn]
    current_index: int = 0
    finished: bool = False


def _demo_feedback(answer: str) -> dict[str, Any]:
    """Deterministic canned feedback used when no OpenAI key is configured."""
    word_count = len(answer.split())
    score = 3 if word_count < 40 else 4
    return {
        "score": score,
        "strengths": [
            "Clear structure to the answer.",
            "Relevant example for the question asked.",
        ],
        "improvements": [
            "Add a quantified result (numbers, % impact, time saved).",
            "Make sure the 'Action' section focuses on what *you* personally did.",
        ],
        "suggested_rewrite": (
            "In [situation], I was responsible for [task]. I decided to "
            "[key action], and as a result [quantified outcome]."
        ),
        "demo_mode": True,
    }


def _llm_feedback(question: str, answer: str) -> dict[str, Any]:
    from langchain_openai import ChatOpenAI

    context = rag.retrieve_context(f"How to answer: {question}. STAR method feedback.")
    prompt = config.FEEDBACK_PROMPT_TEMPLATE.format(
        context=context or "(no additional context)", question=question, answer=answer
    )
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.4)
    response = model.invoke(prompt)
    text = response.content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[1] if "\n" in text else text
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = {
            "score": 3,
            "strengths": [],
            "improvements": [],
            "suggested_rewrite": text[:500],
        }
    data["demo_mode"] = False
    return data


def generate_feedback(question: str, answer: str) -> dict[str, Any]:
    if config.DEMO_MODE:
        return _demo_feedback(answer)
    try:
        return _llm_feedback(question, answer)
    except Exception:
        # Never let a live API hiccup break the session — fall back gracefully.
        fallback = _demo_feedback(answer)
        fallback["error"] = "Live feedback temporarily unavailable; showing a fallback."
        return fallback


def create_session(track: str) -> Session:
    track = track if track in TRACK_LABELS else "general"
    questions = pick_questions(track, config.QUESTIONS_PER_SESSION)
    session = Session(
        id=str(uuid.uuid4()),
        track=track,
        turns=[Turn(question=q) for q in questions],
    )
    _SESSIONS[session.id] = session
    return session


def get_session(session_id: str) -> Session | None:
    return _SESSIONS.get(session_id)


def submit_answer(session: Session, answer: str) -> dict[str, Any]:
    turn = session.turns[session.current_index]
    turn.answer = answer
    turn.feedback = generate_feedback(turn.question, answer)

    session.current_index += 1
    if session.current_index >= len(session.turns):
        session.finished = True

    return turn.feedback


def summary(session: Session) -> dict[str, Any]:
    scores = [t.feedback["score"] for t in session.turns if t.feedback]
    avg = round(sum(scores) / len(scores), 2) if scores else 0
    all_improvements = [i for t in session.turns if t.feedback for i in t.feedback.get("improvements", [])]
    themes = list(dict.fromkeys(all_improvements))[:3]
    return {
        "session_id": session.id,
        "track": session.track,
        "track_label": TRACK_LABELS.get(session.track, session.track),
        "average_score": avg,
        "questions_answered": len(scores),
        "top_improvement_themes": themes,
        "transcript": [
            {
                "question": t.question,
                "answer": t.answer,
                "feedback": t.feedback,
            }
            for t in session.turns
        ],
    }


def session_public_state(session: Session) -> dict[str, Any]:
    if session.finished:
        return {"finished": True, **summary(session)}
    turn = session.turns[session.current_index]
    return {
        "session_id": session.id,
        "finished": False,
        "track": session.track,
        "track_label": TRACK_LABELS.get(session.track, session.track),
        "question": turn.question,
        "index": session.current_index,
        "total": len(session.turns),
    }
