import uuid
import json
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Text, DateTime, ForeignKey, Enum, Boolean
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    student = "student"
    recruiter = "recruiter"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"
    hired = "hired"


# ─────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
# Student Profile
# ─────────────────────────────────────────────────────────────
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    college = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    # JSON list of skills e.g. ["Python", "FastAPI", "SQL"]
    skills_json = Column(Text, default="[]")
    # JSON list of desired roles e.g. ["Backend Developer", "Data Engineer"]
    desired_roles_json = Column(Text, default="[]")
    # AI-generated professional summary
    ai_summary = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    resume = relationship("Resume", back_populates="student", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    mock_interviews = relationship("MockInterview", back_populates="student", cascade="all, delete-orphan")

    @property
    def skills(self):
        return json.loads(self.skills_json or "[]")

    @skills.setter
    def skills(self, value):
        self.skills_json = json.dumps(value)

    @property
    def desired_roles(self):
        return json.loads(self.desired_roles_json or "[]")

    @desired_roles.setter
    def desired_roles(self, value):
        self.desired_roles_json = json.dumps(value)


# ─────────────────────────────────────────────────────────────
# Resume
# ─────────────────────────────────────────────────────────────
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("student_profiles.id"), unique=True, nullable=False)
    original_filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    # AI parsed data stored as JSON string
    ai_parsed_data_json = Column(Text, nullable=True)
    is_parsed = Column(Boolean, default=False)

    student = relationship("StudentProfile", back_populates="resume")

    @property
    def ai_parsed_data(self):
        if self.ai_parsed_data_json:
            return json.loads(self.ai_parsed_data_json)
        return None

    @ai_parsed_data.setter
    def ai_parsed_data(self, value):
        self.ai_parsed_data_json = json.dumps(value) if value else None


# ─────────────────────────────────────────────────────────────
# Recruiter Profile
# ─────────────────────────────────────────────────────────────
class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    company_website = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="recruiter_profile")
    jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
# Job
# ─────────────────────────────────────────────────────────────
class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("recruiter_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    job_type = Column(String, default="Full-time")  # Full-time, Internship, Part-time
    salary_range = Column(String, nullable=True)
    experience_required = Column(String, nullable=True)
    # JSON list of required skills
    required_skills_json = Column(Text, default="[]")
    # JSON list of preferred roles/backgrounds
    preferred_roles_json = Column(Text, default="[]")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)

    recruiter = relationship("RecruiterProfile", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    @property
    def required_skills(self):
        return json.loads(self.required_skills_json or "[]")

    @required_skills.setter
    def required_skills(self, value):
        self.required_skills_json = json.dumps(value)

    @property
    def preferred_roles(self):
        return json.loads(self.preferred_roles_json or "[]")

    @preferred_roles.setter
    def preferred_roles(self, value):
        self.preferred_roles_json = json.dumps(value)


# ─────────────────────────────────────────────────────────────
# Application
# ─────────────────────────────────────────────────────────────
class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("student_profiles.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied)
    cover_note = Column(Text, nullable=True)
    ai_match_score = Column(Float, nullable=True)   # 0-100 score from AI ranking
    ai_match_reasoning = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")


# ─────────────────────────────────────────────────────────────
# Mock Interview
# ─────────────────────────────────────────────────────────────
class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("student_profiles.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    questions_json = Column(Text, nullable=False)     # JSON string of questions
    answers_json = Column(Text, nullable=False)       # JSON string of answers
    evaluation_json = Column(Text, nullable=True)     # JSON string of AI evaluation
    overall_score = Column(Integer, nullable=True)
    overall_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="mock_interviews")
    job = relationship("Job")
