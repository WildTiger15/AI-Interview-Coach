"""Rebuild the Chroma vector index from backend/data/knowledge.

Run from the `backend/` directory:
    python -m scripts.build_index

Requires a real OPENAI_API_KEY in `.env` (embeddings need a live API call).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config, rag  # noqa: E402


def main():
    if config.DEMO_MODE:
        print(
            "No OPENAI_API_KEY configured in backend/.env — the app will run in "
            "demo mode without a vector index. Add a real key and re-run this "
            "script to enable retrieval-grounded feedback."
        )
        return

    print(f"Reading documents from {config.DATA_DIR} ...")
    count = rag.build_index()
    print(f"Indexed {count} chunks into {config.DB_PATH}")


if __name__ == "__main__":
    main()
