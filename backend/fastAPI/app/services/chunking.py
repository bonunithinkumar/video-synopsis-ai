import tiktoken
from app.core.constants import MODEL, CHUNK_SIZE, CHUNK_OVERLAP

def count_tokens(text: str) -> int:
    try:
        encoder = tiktoken.encoding_for_model(MODEL)
    except KeyError:
        encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))

def chunk_text(text: str) -> list[str]:
    try:
        encoder = tiktoken.encoding_for_model(MODEL)
    except KeyError:
        encoder = tiktoken.get_encoding("cl100k_base")

    tokens = encoder.encode(text)
    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + CHUNK_SIZE, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(encoder.decode(chunk_tokens))
        start += CHUNK_SIZE - CHUNK_OVERLAP   # slide forward with overlap
    return chunks
