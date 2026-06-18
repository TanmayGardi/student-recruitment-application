from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RecruiterProfile, Job, Application, StudentProfile
from app.schemas import (
    JobCreate, JobOut, JobUpdate,
    ApplicationOut, ApplicationStatusUpdate, StudentBasicOut,
)
from app.dependencies import get_current_user, require_recruiter

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def enrich_job(j: Job) -> JobOut:
    out = JobOut.model_validate(j)
    out.required_skills = j.required_skills
    out.preferred_roles = j.preferred_roles
    if j.recruiter:
        out.company_name = j.recruiter.company_name
    out.application_count = len(j.applications)
    return out


def enrich_application(app: Application) -> ApplicationOut:
    out = ApplicationOut.model_validate(app)
    # Enrich with job info
    if app.job:
        out.job_title = app.job.title
        out.job_type = app.job.job_type
        if app.job.recruiter:
            out.company_name = app.job.recruiter.company_name
    # Enrich with student info
    if app.student:
        s = app.student
        out.student = StudentBasicOut(
            id=s.id,
            full_name=s.full_name,
            college=s.college,
            cgpa=s.cgpa,
            skills=s.skills,
            degree=s.degree,
            branch=s.branch,
            graduation_year=s.graduation_year,
        )
    return out


# ─────────────────────────────────────────────────────────────
# IMPORTANT: /my/listings MUST come before /{job_id}
# ─────────────────────────────────────────────────────────────
@router.get("/my/listings", summary="Get all your job postings", response_model=List[JobOut])
def my_job_listings(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Returns all jobs posted by the authenticated recruiter."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        return []  # No profile yet → empty list, not 404

    results = []
    for j in profile.jobs:
        results.append(enrich_job(j))
    return results


@router.get("", summary="List all active job postings", response_model=List[JobOut])
def list_jobs(
    search: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Browse all active jobs. Accessible by both students and recruiters."""
    query = db.query(Job).filter(Job.is_active == True)
    if search:
        query = query.filter(
            (Job.title.ilike(f"%{search}%")) | (Job.description.ilike(f"%{search}%"))
        )
    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    jobs = query.order_by(Job.created_at.desc()).all()
    return [enrich_job(j) for j in jobs]


@router.get("/{job_id}", summary="Get a specific job by ID", response_model=JobOut)
def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return enrich_job(job)


# ─────────────────────────────────────────────────────────────
# Job Management (Recruiter only)
# ─────────────────────────────────────────────────────────────
@router.post("", summary="Create a new job posting", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Create a new job posting. Only accessible by recruiters."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        # Auto-create profile if missing
        profile = RecruiterProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    job = Job(
        recruiter_id=profile.id,
        title=data.title,
        description=data.description,
        location=data.location,
        job_type=data.job_type,
        salary_range=data.salary_range,
        experience_required=data.experience_required,
        deadline=data.deadline,
    )
    job.required_skills = data.required_skills
    job.preferred_roles = data.preferred_roles

    db.add(job)
    db.commit()
    db.refresh(job)
    return enrich_job(job)


@router.put("/{job_id}", summary="Update a job posting", response_model=JobOut)
def update_job(
    job_id: str,
    data: JobUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Update fields of an existing job posting. Only the owner recruiter can update."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "required_skills":
            job.required_skills = value
        elif field == "preferred_roles":
            job.preferred_roles = value
        else:
            setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return enrich_job(job)


@router.delete("/{job_id}", summary="Delete a job posting", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Permanently delete a job posting. Only the owner recruiter can delete."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    db.delete(job)
    db.commit()


# ─────────────────────────────────────────────────────────────
# Application Management (Recruiter)
# ─────────────────────────────────────────────────────────────
@router.get("/{job_id}/applicants", summary="List all applicants for a job", response_model=List[ApplicationOut])
def list_applicants(
    job_id: str,
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Returns all applications for a job, enriched with student info."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    apps = job.applications
    if status_filter:
        apps = [a for a in apps if a.status.value == status_filter]

    apps = sorted(apps, key=lambda a: a.ai_match_score or 0, reverse=True)
    return [enrich_application(a) for a in apps]


@router.patch("/{job_id}/applicants/{application_id}/status", summary="Update application status", response_model=ApplicationOut)
def update_application_status(
    job_id: str,
    application_id: str,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Update the status of an application (shortlist, reject, hire)."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    application = db.query(Application).filter(
        Application.id == application_id,
        Application.job_id == job_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = data.status
    db.commit()
    db.refresh(application)
    return enrich_application(application)
