from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="owner")
    applications = relationship("Application", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_url = Column(String)  # If stored in S3/Local
    
    # AI Parsed Data
    parsed_skills = Column(JSON)
    parsed_education = Column(JSON)
    parsed_experience = Column(JSON)
    ats_score = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String)
    salary_range = Column(String)
    description = Column(Text)
    job_type = Column(String)  # Internship, Full-time, Remote
    required_skills = Column(JSON)
    source_url = Column(String)
    
    # Vector embedding ID reference for semantic search
    embedding_id = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String, default="Saved") # Saved, Applied, Interviewing, Rejected
    match_score = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
