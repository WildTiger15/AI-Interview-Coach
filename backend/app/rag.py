"""Vector-store backed retrieval over the interview-coaching knowledge base."""

from __future__ import annotations

import os
from functools import lru_cache

from . import config


def build_index() -> int:
    """(Re)build the Chroma index from backend/data/knowledge. Returns chunk count."""
    import shutil

    from langchain_chroma import Chroma
    from langchain_community.document_loaders import DirectoryLoader
    from langchain_openai import OpenAIEmbeddings
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    if os.path.exists(config.DB_PATH):
        shutil.rmtree(config.DB_PATH)

    loader = DirectoryLoader(str(config.DATA_DIR), glob=["*.md", "*.txt"])
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800, chunk_overlap=150, add_start_index=True
    )
    chunks = splitter.split_documents(documents)

    Chroma.from_documents(chunks, OpenAIEmbeddings(), persist_directory=config.DB_PATH)
    return len(chunks)


@lru_cache(maxsize=1)
def _get_database():
    from langchain_chroma import Chroma
    from langchain_openai import OpenAIEmbeddings

    return Chroma(persist_directory=config.DB_PATH, embedding_function=OpenAIEmbeddings())


def retrieve_context(query: str, k: int = 4) -> str:
    """Return concatenated context chunks relevant to `query`, or "" if none/available."""
    if config.DEMO_MODE or not os.path.exists(config.DB_PATH):
        return ""

    try:
        database = _get_database()
        results = database.similarity_search_with_relevance_scores(query, k=k)
    except Exception:
        return ""

    relevant = [doc for doc, score in results if score >= config.SIMILARITY_THRESHOLD]
    if not relevant:
        return ""
    return "\n\n---\n\n".join(doc.page_content for doc in relevant)
