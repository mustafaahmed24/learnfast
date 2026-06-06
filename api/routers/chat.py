import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from .gemini_helper import generate_with_retry

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class ChatRequest(BaseModel):
    message: str
    context: str = ""
    history: list = []


class ChatResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = """You are LearnFast's AI tutor. You help learners understand coding and tech concepts.
Be concise, clear, and encouraging. Use examples and analogies where helpful.
If the user is stuck, guide them with hints rather than giving full answers immediately."""


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        history_parts = []
        for msg in req.history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            history_parts.append(
                types.Content(role=role, parts=[types.Part(text=msg["content"])])
            )

        full_prompt = (
            f"{SYSTEM_PROMPT}\n\nCurrent topic context: {req.context}\n\nUser: {req.message}"
        )

        text = generate_with_retry(
            client, "gemini-2.5-flash",
            full_prompt,
            types.GenerateContentConfig(temperature=0.7, max_output_tokens=2048),
        )
        return ChatResponse(reply=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
