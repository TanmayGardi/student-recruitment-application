import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RecruiterProfile, StudentProfile, Job, Application, MockInterview
from app.schemas import RecruiterProfileCreate, RecruiterProfileOut, StudentProfileOut, RecruiterAnalyticsOut, SkillDistribution, MockInterviewDetailOut
from app.dependencies import require_recruiter

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])


def get_or_create_recruiter_profile(current_user: User, db: Session) -> RecruiterProfile:
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        profile = RecruiterProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ─────────────────────────────────────────────────────────────
# Recruiter Profile
# ─────────────────────────────────────────────────────────────
@router.get("/profile", summary="Get your recruiter profile", response_model=RecruiterProfileOut)
def get_recruiter_profile(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Returns the recruiter profile. Auto-creates if missing."""
    return get_or_create_recruiter_profile(current_user, db)


@router.put("/profile", summary="Create or update your recruiter profile", response_model=RecruiterProfileOut)
def update_recruiter_profile(
    data: RecruiterProfileCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Update recruiter company profile."""
    profile = get_or_create_recruiter_profile(current_user, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


# ─────────────────────────────────────────────────────────────
# Student Discovery
# ─────────────────────────────────────────────────────────────
@router.get("/students/search", summary="Search and filter students", response_model=List[StudentProfileOut])
def search_students(
    skills: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    min_cgpa: Optional[float] = Query(None, ge=0.0, le=10.0),
    graduation_year: Optional[int] = Query(None),
    college: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("name"),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Search students by skills, role, CGPA, graduation year, college."""
    query = db.query(StudentProfile)

    if min_cgpa is not None:
        query = query.filter(StudentProfile.cgpa >= min_cgpa)
    if graduation_year is not None:
        query = query.filter(StudentProfile.graduation_year == graduation_year)
    if college:
        query = query.filter(StudentProfile.college.ilike(f"%{college}%"))

    students = query.all()

    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        students = [
            s for s in students
            if any(sk in [x.lower() for x in s.skills] for sk in skill_list)
        ]
    if role:
        role_lower = role.lower()
        students = [
            s for s in students
            if any(role_lower in r.lower() for r in s.desired_roles)
        ]

    if sort_by == "cgpa":
        students = sorted(students, key=lambda s: s.cgpa or 0, reverse=True)
    else:
        students = sorted(students, key=lambda s: s.full_name or "")

    results = []
    for s in students:
        out = StudentProfileOut.model_validate(s)
        out.skills = s.skills
        out.desired_roles = s.desired_roles
        out.has_resume = s.resume is not None
        results.append(out)
    return results


@router.get("/students/{student_id}", summary="View a student's public profile", response_model=StudentProfileOut)
def get_student_profile(
    student_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Fetch the full profile of any student by their profile ID."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student not found")
    out = StudentProfileOut.model_validate(profile)
    out.skills = profile.skills
    out.desired_roles = profile.desired_roles
    out.has_resume = profile.resume is not None
    return out


@router.get("/students/{student_id}/resume", summary="Download a student's resume PDF")
def download_student_resume(
    student_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Serve a specific student's PDF resume file to the recruiter."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not profile or not profile.resume:
        raise HTTPException(status_code=404, detail="No resume uploaded for this student")
    filepath = profile.resume.filepath
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Resume file not found on disk")
    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=profile.resume.original_filename
    )


@router.get("/analytics", summary="Get aggregated placement metrics for the recruiter", response_model=RecruiterAnalyticsOut)
def get_recruiter_analytics(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """
    Computes aggregated placement statistics for this recruiter's job postings:
    - Total posted jobs
    - Total applicants across all postings
    - Average CGPA of all applicants
    - Top 5 skills among all applicants
    """
    recruiter = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
        
    # Get all jobs posted by this recruiter
    job_ids = [j.id for j in db.query(Job).filter(Job.recruiter_id == recruiter.id).all()]
    total_jobs = len(job_ids)
    
    if total_jobs == 0:
        return RecruiterAnalyticsOut(
            total_jobs=0,
            total_applications=0,
            average_cgpa=None,
            top_skills=[]
        )
        
    # Total applications
    total_applications = db.query(Application).filter(Application.job_id.in_(job_ids)).count()
    
    # Average CGPA of all applicants
    avg_cgpa = db.query(func.avg(StudentProfile.cgpa)).\
        join(Application, Application.student_id == StudentProfile.id).\
        filter(Application.job_id.in_(job_ids)).scalar()
        
    # Top skills among applicants
    applicants = db.query(StudentProfile).\
        join(Application, Application.student_id == StudentProfile.id).\
        filter(Application.job_id.in_(job_ids)).all()
        
    skills_map = {}
    for app in applicants:
        if app.skills:
            for skill in app.skills:
                skill_clean = skill.strip().lower()
                if skill_clean:
                    skills_map[skill_clean] = skills_map.get(skill_clean, 0) + 1
                    
    # Sort and take top 5
    top_skills_sorted = sorted(skills_map.items(), key=lambda item: item[1], reverse=True)[:5]
    top_skills = [SkillDistribution(skill=k.title(), count=v) for k, v in top_skills_sorted]
    
    return RecruiterAnalyticsOut(
        total_jobs=total_jobs,
        total_applications=total_applications,
        average_cgpa=round(avg_cgpa, 2) if avg_cgpa is not None else None,
        top_skills=top_skills
    )


@router.get("/students/{student_id}/interviews", summary="Get a student's mock interview history for the recruiter", response_model=List[MockInterviewDetailOut])
def get_student_mock_interviews(
    student_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """Retrieves all mock interviews completed by a specific student, allowing recruiters to inspect performance."""
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    interviews = db.query(MockInterview).filter(MockInterview.student_id == student.id).order_by(MockInterview.created_at.desc()).all()
    
    results = []
    for iv in interviews:
        results.append(
            MockInterviewDetailOut(
                id=iv.id,
                job_id=iv.job_id,
                job_title=iv.job.title if iv.job else "Unknown Role",
                company_name=iv.job.recruiter.company_name if iv.job and iv.job.recruiter else None,
                questions=json.loads(iv.questions_json or "[]"),
                answers=json.loads(iv.answers_json or "[]"),
                evaluations=json.loads(iv.evaluation_json or "[]"),
                overall_score=iv.overall_score,
                overall_feedback=iv.overall_feedback,
                created_at=iv.created_at
            )
        )
    return results


