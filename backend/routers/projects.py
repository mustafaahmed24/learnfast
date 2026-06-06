import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from .gemini_helper import generate_with_retry

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class ProjectRequest(BaseModel):
    topic: str
    stage: str = ""
    difficulty: str = "intermediate"

class ProjectResponse(BaseModel):
    projects: list

SYSTEM_PROMPT = """You are LearnFast's project generator. Create hands-on project ideas.

Return ONLY valid JSON with this exact structure:
{
  "projects": [
    {
      "id": "proj-1",
      "title": "Project Title",
      "description": "Brief project description",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "skills": ["skill1", "skill2"],
      "estimatedHours": 5,
      "learningObjectives": ["objective1", "objective2"],
      "features": ["feature1", "feature2"],
      "xp": 150
    }
  ]
}

Generate 2-3 project ideas that reinforce the learned concepts."""

@router.post("/generate-projects", response_model=ProjectResponse)
async def generate_projects(req: ProjectRequest):
    try:
        context = f"Topic: {req.topic}\nDifficulty: {req.difficulty}"
        if req.stage:
            context += f"\nStage: {req.stage}"
        text = generate_with_retry(
            client, "gemini-2.5-flash",
            f"{SYSTEM_PROMPT}\n\n{context}",
            types.GenerateContentConfig(temperature=0.8, max_output_tokens=4096),
        )
        data = json.loads(text)
        return ProjectResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
