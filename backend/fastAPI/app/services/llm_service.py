from fastapi import HTTPException
from groq import Groq
from app.core.config import GROQ_API_KEY
from app.core.constants import MODEL, REDUCE_OUTPUT_TOKENS

client = Groq(
    api_key=GROQ_API_KEY,
)

def call_llm(prompt: str, max_output_tokens: int = REDUCE_OUTPUT_TOKENS) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_output_tokens,
    )
    choice = response.choices[0]
    if choice.finish_reason == "length":
        raise HTTPException(
            status_code=502,
            detail="LLM output was truncated (hit max_tokens limit). Increase REDUCE_OUTPUT_TOKENS or shorten the prompt."
        )
    return choice.message.content
