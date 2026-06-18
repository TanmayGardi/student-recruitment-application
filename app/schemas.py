from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────
class UserRoleEnum(str, Enum):
    student = "student"
    recruiter = "recruiter"


class ApplicationStatusEnum(str, Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"
    hired = "hired"


# ─────────────────────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────────────────────
class UserAuth(BaseModel):
    """Schema used for user registration."""
    username: str = Field(min_length=3, max_length=30, examples=["john_doe"])
    email: EmailStr = Field(examples=["john@example.com"])
    password: str = Field(min_length=6, max_length=100, examples=["secure123"])
    role: UserRoleEnum = Field(examples=["student"], description="Either 'student' or 'recruiter'")


class UserOut(BaseModel):
    """Schema returned to the client after signup or /me."""
    id: str
    username: str
    email: str
    role: UserRoleEnum

    model_config = {"from_attributes": True}


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ─────────────────────────────────────────────────────────────
# Student Schemas
# ─────────────────────────────────────────────────────────────
class StudentProfileCreate(BaseModel):
    """Schema for creating or updating a student profile."""
    full_name: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = Field(None, ge=2020, le=2035)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)
    bio: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = []
    desired_roles: Optional[List[str]] = []


class StudentProfileOut(BaseModel):
    """Schema returned for student profile data."""
    id: str
    user_id: str
    full_name: Optional[str]
    college: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[int]
    cgpa: Optional[float]
    bio: Optional[str]
    phone: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    skills: List[str] = []
    desired_roles: List[str] = []
    ai_summary: Optional[str]
    has_resume: bool = False

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Resume Schemas
# ─────────────────────────────────────────────────────────────
class ResumeOut(BaseModel):
    """Schema for resume metadata returned to clients."""
    id: str
    original_filename: str
    uploaded_at: datetime
    is_parsed: bool
    ai_parsed_data: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Recruiter Schemas
# ─────────────────────────────────────────────────────────────
class RecruiterProfileCreate(BaseModel):
    """Schema for creating or updating a recruiter profile."""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    industry: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None


class RecruiterProfileOut(BaseModel):
    """Schema returned for recruiter profile data."""
    id: str
    user_id: str
    full_name: Optional[str]
    company_name: Optional[str]
    company_website: Optional[str]
    industry: Optional[str]
    designation: Optional[str]
    phone: Optional[str]
    linkedin_url: Optional[str]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Job Schemas
# ─────────────────────────────────────────────────────────────
class JobCreate(BaseModel):
    """Schema for posting a new job."""
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20)
    location: Optional[str] = None
    job_type: Optional[str] = "Full-time"
    salary_range: Optional[str] = None
    experience_required: Optional[str] = None
    required_skills: List[str] = []
    preferred_roles: List[str] = []
    deadline: Optional[datetime] = None


class JobOut(BaseModel):
    """Schema for job listing response."""
    id: str
    recruiter_id: str
    title: str
    description: str
    location: Optional[str]
    job_type: Optional[str]
    salary_range: Optional[str]
    experience_required: Optional[str]
    required_skills: List[str] = []
    preferred_roles: List[str] = []
    is_active: bool
    created_at: datetime
    deadline: Optional[datetime]
    company_name: Optional[str] = None
    application_count: int = 0

    model_config = {"from_attributes": True}


class JobUpdate(BaseModel):
    """Schema for updating job fields."""
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_range: Optional[str] = None
    experience_required: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    is_active: Optional[bool] = None
    deadline: Optional[datetime] = None


# ─────────────────────────────────────────────────────────────
# Application Schemas
# ─────────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    cover_note: Optional[str] = None


class StudentBasicOut(BaseModel):
    """Minimal student info embedded in application responses."""
    id: str
    full_name: Optional[str]
    college: Optional[str]
    cgpa: Optional[float]
    skills: List[str] = []
    degree: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[int]

    model_config = {"from_attributes": True}


class ApplicationOut(BaseModel):
    id: str
    student_id: str
    job_id: str
    status: ApplicationStatusEnum
    cover_note: Optional[str]
    ai_match_score: Optional[float]
    ai_match_reasoning: Optional[str]
    applied_at: datetime
    # Enriched fields
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    job_type: Optional[str] = None
    student: Optional[StudentBasicOut] = None

    model_config = {"from_attributes": True}


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum


# ─────────────────────────────────────────────────────────────
# AI Schemas
# ─────────────────────────────────────────────────────────────
class AIResumeParseResult(BaseModel):
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    certifications: List[str] = []
    languages: List[str] = []
    summary: Optional[str] = None


class AIRankedCandidate(BaseModel):
    student_id: str
    full_name: Optional[str]
    email: str
    college: Optional[str]
    cgpa: Optional[float]
    skills: List[str]
    ai_match_score: float
    ai_match_reasoning: str


class AIRankResult(BaseModel):
    job_id: str
    job_title: str
    ranked_candidates: List[AIRankedCandidate]


class AIJobMatch(BaseModel):
    job_id: str
    job_title: str
    company_name: Optional[str]
    match_score: float
    match_reasoning: str
    missing_skills: List[str] = []


class AIJobMatchResult(BaseModel):
    student_id: str
    recommended_jobs: List[AIJobMatch]


class AISkillGapResult(BaseModel):
    student_id: str
    job_id: str
    job_title: str
    student_skills: List[str]
    required_skills: List[str]
    matching_skills: List[str]
    missing_skills: List[str]
    match_percentage: float
    learning_suggestions: List[Dict[str, str]] = []


class AISummaryResult(BaseModel):
    student_id: str
    summary: str