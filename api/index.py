import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers.roadmap import router as roadmap_router
from routers.chat import router as chat_router
from routers.tests import router as tests_router
from routers.projects import router as projects_router

app = FastAPI(title="LearnFast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roadmap_router, prefix="/api", tags=["roadmap"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(tests_router, prefix="/api", tags=["tests"])
app.include_router(projects_router, prefix="/api", tags=["projects"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
