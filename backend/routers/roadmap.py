import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from .gemini_helper import generate_with_retry

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class RoadmapRequest(BaseModel):
    topic: str

class RoadmapResponse(BaseModel):
    title: str
    stages: list

SYSTEM_PROMPT = """You are LearnFast, an AI learning companion. Generate a structured learning roadmap.

Return ONLY valid JSON with this exact structure:
{
  "title": "Roadmap title",
  "stages": [
    {
      "id": "stage-1",
      "title": "Stage title",
      "description": "Brief description of this stage",
      "nodes": [
        {
          "id": "node-1-1",
          "title": "Topic title",
          "description": "What this topic covers",
          "type": "concept" | "project" | "quiz",
          "resources": ["resource1", "resource2"],
          "xp": 50
        }
      ]
    }
  ]
}

Generate 3-5 stages with 2-4 nodes each. Assign appropriate XP values (25-100)."""

@router.post("/roadmap", response_model=RoadmapResponse)
async def generate_roadmap(req: RoadmapRequest):
    try:
        text = generate_with_retry(
            client, "gemini-2.5-flash",
            f"{SYSTEM_PROMPT}\n\nTopic: {req.topic}",
            types.GenerateContentConfig(temperature=0.7, max_output_tokens=4096),
        )
        data = json.loads(text)
        return RoadmapResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
