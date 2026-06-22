import re

def extract_json(text: str) -> str:
    # Strip markdown fences and extra prose to extract only the raw JSON object.
    text = text.strip()

    # Remove markdown code fences (```json ... ``` or ``` ... ```)
    if text.startswith("```"):
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()

    # Extract just the JSON object (from first '{' to last '}')
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx + 1]

    return text

def sanitize_transcript(text: str) -> str:
    # remove zero-width chars
    text = re.sub(
        r'[\u200B\u200C\u200D\uFEFF]',
        '',
        text
    )

    # normalize quotes
    text = text.replace("’", "'")
    text = text.replace("“", '"')
    text = text.replace("”", '"')

    # collapse spaces
    text = re.sub(r'\s+', ' ', text)

    # collapse repeated words
    text = re.sub(
        r'\b(\w+)\s+\1\b',
        r'\1',
        text,
        flags=re.IGNORECASE
    )
    return text.strip()
