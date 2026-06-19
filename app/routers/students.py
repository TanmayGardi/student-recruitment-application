import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, StudentProfile, Resume, Job, Application
from app.schemas import (
    StudentProfileCreate, StudentProfileOut,
    ResumeOut, JobOut, ApplicationCreate, ApplicationOut, StudentBasicOut,
)
from app.dependencies import get_current_user, require_student
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/students", tags=["Students"])


def enrich_application(app: Application) -> ApplicationOut:
    out = ApplicationOut.model_validate(app)
    if app.job:
        out.job_title = app.job.title
        out.job_type = app.job.job_type
        if app.job.recruiter:
            out.company_name = app.job.recruiter.company_name
    if app.student:
        s = app.student
        out.student = StudentBasicOut(
            id=s.id, full_name=s.full_name, college=s.college, cgpa=s.cgpa,
            skills=s.skills, degree=s.degree, branch=s.branch, graduation_year=s.graduation_year,
        )
    return out


def get_or_create_profile(current_user: User, db: Session) -> StudentProfile:
    """Get existing student profile or auto-create a blank one."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ─────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────
@router.get("/profile", summary="Get your student profile", response_model=StudentProfileOut)
def get_my_profile(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Returns the profile of the authenticated student. Auto-creates if missing."""
    profile = get_or_create_profile(current_user, db)
    out = StudentProfileOut.model_validate(profile)
    out.skills = profile.skills
    out.desired_roles = profile.desired_roles
    out.has_resume = profile.resume is not None
    return out


@router.put("/profile", summary="Create or update your student profile", response_model=StudentProfileOut)
def update_my_profile(
    data: StudentProfileCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Update student profile fields. All fields are optional."""
    profile = get_or_create_profile(current_user, db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "skills":
            profile.skills = value
        elif field == "desired_roles":
            profile.desired_roles = value
        else:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    out = StudentProfileOut.model_validate(profile)
    out.skills = profile.skills
    out.desired_roles = profile.desired_roles
    out.has_resume = profile.resume is not None
    return out


# ─────────────────────────────────────────────────────────────
# Resume Upload & Retrieval
# ─────────────────────────────────────────────────────────────
@router.post("/resume", summary="Upload your resume (PDF)", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(..., description="PDF resume file"),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Upload or replace your PDF resume."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    profile = get_or_create_profile(current_user, db)

    # Remove old resume file if exists
    existing = db.query(Resume).filter(Resume.student_id == profile.id).first()
    if existing:
        if os.path.exists(existing.filepath):
            os.remove(existing.filepath)
        db.delete(existing)
        db.flush()

    safe_name = f"{profile.id}_{file.filename.replace(' ', '_')}"
    filepath = os.path.join(UPLOAD_DIR, safe_name)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume = Resume(
        student_id=profile.id,
        original_filename=file.filename,
        filepath=filepath,
        is_parsed=False,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/resume", summary="Get your resume info and AI parse data", response_model=ResumeOut)
def get_my_resume(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Returns resume metadata and any AI-extracted data. 404 if no resume."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    resume = profile.resume
    out = ResumeOut.model_validate(resume)
    out.ai_parsed_data = resume.ai_parsed_data
    return out


@router.get("/resume/download", summary="Download your own resume PDF")
def download_my_resume(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Serve the student's uploaded PDF resume file."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    filepath = profile.resume.filepath
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Resume file not found on disk")
    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=profile.resume.original_filename
    )



# ─────────────────────────────────────────────────────────────
# Browse Jobs
# ─────────────────────────────────────────────────────────────
@router.get("/jobs", summary="Browse available job listings", response_model=List[JobOut])
def browse_jobs(
    search: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Browse active job listings with optional filters."""
    query = db.query(Job).filter(Job.is_active == True)

    if search:
        query = query.filter(
            (Job.title.ilike(f"%{search}%")) | (Job.description.ilike(f"%{search}%"))
        )
    if job_type and job_type.lower() != "all":
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    jobs = query.order_by(Job.created_at.desc()).all()

    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        filtered = []
        for j in jobs:
            job_skills = [s.lower() for s in j.required_skills]
            if any(s in job_skills for s in skill_list):
                filtered.append(j)
        jobs = filtered

    results = []
    for j in jobs:
        out = JobOut.model_validate(j)
        out.required_skills = j.required_skills
        out.preferred_roles = j.preferred_roles
        if j.recruiter and j.recruiter.company_name:
            out.company_name = j.recruiter.company_name
        out.application_count = len(j.applications)
        results.append(out)
    return results


# ─────────────────────────────────────────────────────────────
# Applications
# ─────────────────────────────────────────────────────────────
@router.post("/jobs/{job_id}/apply", summary="Apply to a job", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: str,
    data: ApplicationCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Apply to a job posting. Optionally add a cover note."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    profile = get_or_create_profile(current_user, db)

    existing = db.query(Application).filter(
        Application.student_id == profile.id,
        Application.job_id == job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    application = Application(
        student_id=profile.id,
        job_id=job_id,
        cover_note=data.cover_note,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return enrich_application(application)


@router.get("/applications", summary="View your job applications", response_model=List[ApplicationOut])
def my_applications(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Returns all job applications made by the authenticated student, enriched with job info."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return []  # No profile yet → empty list
    return [enrich_application(a) for a in profile.applications]
