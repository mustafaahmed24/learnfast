from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User, SavedRoadmap, NodeProgress
from routers.auth import get_current_user, get_optional_user

router = APIRouter()


class SaveRoadmapRequest(BaseModel):
    topic: str
    title: str
    roadmap_data: dict


class UpdateProgressRequest(BaseModel):
    roadmap_id: str
    node_id: str
    completed: bool = True
    test_score: int | None = None


class SyncDataRequest(BaseModel):
    xp: int
    level: int
    achievements: list
    completed_nodes: dict  # roadmap_id -> [node_ids]


@router.post("/progress/save-roadmap")
def save_roadmap(req: SaveRoadmapRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    roadmap = SavedRoadmap(
        user_id=user.id,
        topic=req.topic,
        title=req.title,
        roadmap_data=req.roadmap_data,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return {"id": roadmap.id, "topic": roadmap.topic, "title": roadmap.title, "created_at": roadmap.created_at.isoformat()}


@router.get("/progress/roadmaps")
def get_roadmaps(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    roadmaps = db.query(SavedRoadmap).filter(SavedRoadmap.user_id == user.id).order_by(SavedRoadmap.created_at.desc()).all()
    return [
        {"id": r.id, "topic": r.topic, "title": r.title, "completed_nodes": r.completed_nodes or [],
         "created_at": r.created_at.isoformat()}
        for r in roadmaps
    ]


@router.get("/progress/roadmaps/{roadmap_id}")
def get_roadmap(roadmap_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    roadmap = db.query(SavedRoadmap).filter(SavedRoadmap.id == roadmap_id, SavedRoadmap.user_id == user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {"id": roadmap.id, "topic": roadmap.topic, "title": roadmap.title, "roadmap_data": roadmap.roadmap_data,
            "completed_nodes": roadmap.completed_nodes or [], "created_at": roadmap.created_at.isoformat()}


@router.delete("/progress/roadmaps/{roadmap_id}")
def delete_roadmap(roadmap_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    roadmap = db.query(SavedRoadmap).filter(SavedRoadmap.id == roadmap_id, SavedRoadmap.user_id == user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()
    return {"ok": True}


@router.post("/progress/sync")
def sync_progress(req: SyncDataRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user.xp = max(user.xp, req.xp)
    user.level = max(user.level, req.level) if user.level else req.level
    merged = list({a.get("id", a): a for a in (user.achievements or []) + req.achievements}.values())
    user.achievements = merged

    for roadmap_id, node_ids in req.completed_nodes.items():
        roadmap = db.query(SavedRoadmap).filter(SavedRoadmap.id == roadmap_id, SavedRoadmap.user_id == user.id).first()
        if roadmap:
            existing = set(roadmap.completed_nodes or [])
            existing.update(node_ids)
            roadmap.completed_nodes = list(existing)

    db.commit()
    return {"ok": True, "xp": user.xp, "level": user.level, "achievements": user.achievements}


@router.get("/progress/state")
def get_progress(user: User = Depends(get_optional_user), db: Session = Depends(get_db)):
    if not user:
        return {"authenticated": False, "xp": 0, "level": 1, "achievements": [], "roadmaps": []}
    roadmaps = db.query(SavedRoadmap).filter(SavedRoadmap.user_id == user.id).all()
    return {
        "authenticated": True,
        "user": {"id": user.id, "email": user.email, "display_name": user.display_name, "xp": user.xp, "level": user.level,
                 "achievements": user.achievements or []},
        "roadmaps": [{"id": r.id, "topic": r.topic, "title": r.title, "completed_nodes": r.completed_nodes or [],
                       "created_at": r.created_at.isoformat()} for r in roadmaps],
    }
