from app.core.constants import (
    SYNOPSIS_SYSTEM_PROMPT,
    MAP_PROMPT_TEMPLATE,
    REDUCE_PREAMBLE,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    MAP_OUTPUT_TOKENS,
    REDUCE_OUTPUT_TOKENS
)
from app.services.chunking import chunk_text
from app.services.llm_service import call_llm

def summarize_single(url: str, title: str, text: str) -> str:
    prompt = SYNOPSIS_SYSTEM_PROMPT + "\n" + text + f"\n\n# Video Title:\n{title}"
    return call_llm(prompt, max_output_tokens=REDUCE_OUTPUT_TOKENS)

def summarize_map_reduce(url: str, title: str, text: str) -> str:
    chunks = chunk_text(text)
    total = len(chunks)
    print(f"[MAP-REDUCE] Splitting into {total} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")

    # ── MAP Phase ────────────────────────────────────────────────
    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"[MAP] Summarizing chunk {i + 1}/{total}...")
        map_prompt = MAP_PROMPT_TEMPLATE.format(
            part=i + 1,
            total=total,
            title=title,
            chunk=chunk,
        )
        # Small output per chunk — stays well within Groq TPM limits
        chunk_summary = call_llm(map_prompt, max_output_tokens=MAP_OUTPUT_TOKENS)
        chunk_summaries.append(chunk_summary)
        print(f"[MAP] Chunk {i + 1} done ({len(chunk_summary)} chars)")

    # ── REDUCE Phase ─────────────────────────────────────────────
    print("[REDUCE] Combining all chunk summaries into final synopsis...")
    combined = "\n\n---\n\n".join(
        [f"### Part {i + 1} of {total}:\n{summary}" for i, summary in enumerate(chunk_summaries)]
    )
    reduce_preamble = REDUCE_PREAMBLE.format(title=title, combined=combined)

    # Pass the combined preamble AS the transcript text into summarize_single.
    # summarize_single will prepend the full SYNOPSIS_SYSTEM_PROMPT, guaranteeing JSON schema compliance.
    return summarize_single(url, title, reduce_preamble)
