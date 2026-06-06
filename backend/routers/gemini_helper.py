import time
import random
import json
from google.genai import types

def generate_with_retry(client, model, contents, config, max_retries=5):
    last_error = None
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )
            text = response.text.strip()
            text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return text
        except Exception as e:
            err_str = str(e)
            last_error = e
            if "503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                wait = min(2 ** attempt + random.random(), 15)
                print(f"Gemini API error, retrying in {wait:.1f}s: {err_str[:100]}")
                time.sleep(wait)
            else:
                raise
    raise last_error
