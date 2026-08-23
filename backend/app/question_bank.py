"""Curated interview questions, grouped by track.

The mock-interview flow draws from this bank rather than relying purely on
an LLM to improvise questions, so the demo is consistent and doesn't need an
API key to produce a coherent set of questions.
"""

from __future__ import annotations

import random

TRACKS: dict[str, list[str]] = {
    "software-engineer": [
        "Tell me about a time you disagreed with a teammate about a technical decision. How did you resolve it?",
        "Describe a bug that was especially hard to track down. How did you find and fix it?",
        "Tell me about a project where the requirements changed midway through. How did you handle it?",
        "Describe a time you had to learn a new technology quickly to finish a project.",
        "Tell me about a time you pushed back on a deadline or scope you thought was unrealistic.",
        "Walk me through a technical decision you made that you'd make differently today.",
        "Tell me about a time you had to explain a technical concept to a non-technical stakeholder.",
        "Describe a time you improved the performance or reliability of a system.",
    ],
    "product-manager": [
        "Tell me about a product decision you made using incomplete data.",
        "Describe a time you had to say no to a stakeholder's feature request. How did you handle it?",
        "Tell me about a launch that didn't go as planned. What did you learn?",
        "Walk me through how you prioritized a roadmap when you had more requests than capacity.",
        "Describe a time you used customer feedback to change a product direction.",
        "Tell me about a time you had to align engineering and design on a disagreement.",
        "Describe how you measured success for a feature you shipped.",
    ],
    "general": [
        "Tell me about yourself.",
        "Tell me about a time you failed. What did you learn?",
        "Describe a time you had too much to do and not enough time. How did you prioritize?",
        "Tell me about a time you took initiative without being asked.",
        "Describe a situation where you had to work with someone difficult.",
        "Tell me about a professional accomplishment you're proud of.",
        "Why do you want to work here?",
        "Where do you see yourself in five years?",
    ],
}

TRACK_LABELS = {
    "software-engineer": "Software Engineer",
    "product-manager": "Product Manager",
    "general": "General / Behavioral",
}


def pick_questions(track: str, count: int) -> list[str]:
    pool = TRACKS.get(track, TRACKS["general"])
    count = min(count, len(pool))
    return random.sample(pool, count)
