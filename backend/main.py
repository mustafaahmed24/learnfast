from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import init_db
from routers import roadmap, chat, tests, projects, auth, progress

init_db()

app = FastAPI(title="LearnFast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roadmap.router, prefix="/api", tags=["roadmap"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(tests.router, prefix="/api", tags=["tests"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(progress.router, prefix="/api", tags=["progress"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
