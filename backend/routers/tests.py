import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from .gemini_helper import generate_with_retry

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TestRequest(BaseModel):
    topic: str
    stage_title: str = ""

class TestResponse(BaseModel):
    questions: list

SYSTEM_PROMPT = """You are LearnFast's test generator. Create a knowledge assessment.

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctIndex": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Generate 5 multiple-choice questions. Mix of recall, comprehension, and application."""

@router.post("/generate-test", response_model=TestResponse)
async def generate_test(req: TestRequest):
    try:
        context = f"Topic: {req.topic}"
        if req.stage_title:
            context += f"\nStage: {req.stage_title}"
        text = generate_with_retry(
            client, "gemini-2.5-flash",
            f"{SYSTEM_PROMPT}\n\n{context}",
            types.GenerateContentConfig(temperature=0.7, max_output_tokens=4096),
        )
        data = json.loads(text)
        return TestResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-answer")
async def evaluate_answer(question: str, user_answer: str, correct_answer: str):
    try:
        text = generate_with_retry(
            client, "gemini-2.5-flash",
            f"""Question: {question}
Correct answer: {correct_answer}
User's answer: {user_answer}

Evaluate if the user's answer is correct. Reply with a JSON:
{{"correct": true/false, "feedback": "brief feedback"}}""",
            types.GenerateContentConfig(temperature=0.3, max_output_tokens=512),
        )
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
