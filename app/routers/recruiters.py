from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RecruiterProfile, StudentProfile
from app.schemas import RecruiterProfileCreate, RecruiterProfileOut, StudentProfileOut
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
