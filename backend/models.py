import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def gen_id():
    return str(uuid.uuid4())[:12]


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=True)
    display_name = Column(String, default="")
    avatar_url = Column(String, default="")
    google_id = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    achievements = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_roadmaps = relationship("SavedRoadmap", back_populates="user", cascade="all, delete-orphan")
    node_progress = relationship("NodeProgress", back_populates="user", cascade="all, delete-orphan")


class SavedRoadmap(Base):
    __tablename__ = "saved_roadmaps"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    title = Column(String, default="")
    roadmap_data = Column(JSON, nullable=False)
    completed_nodes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_roadmaps")


class NodeProgress(Base):
    __tablename__ = "node_progress"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(String, ForeignKey("saved_roadmaps.id"), nullable=False)
    node_id = Column(String, nullable=False)
    completed = Column(Boolean, default=True)
    test_score = Column(Integer, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="node_progress")
