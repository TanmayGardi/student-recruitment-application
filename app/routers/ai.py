"""
AI-powered features using Google Gemini 2.0 Flash.
All endpoints use structured prompts to ensure consistent JSON responses.
"""

import os
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from dotenv import load_dotenv

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

from app.database import get_db
from app.models import User, StudentProfile, Resume, Job, Application, RecruiterProfile
from app.schemas import (
    AIResumeParseResult,
    AIRankResult, AIRankedCandidate,
    AIJobMatchResult, AIJobMatch,
    AISkillGapResult, AISummaryResult,
)
from app.dependencies import get_current_user, require_recruiter, require_student

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

router = APIRouter(prefix="/ai", tags=["AI Features ✨"])


def get_gemini_client():
    """Initialize and return the Gemini client. Reads API key fresh from env each call."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your-gemini-api-key-here":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Gemini API key not configured. "
                "Please set GEMINI_API_KEY in your .env file. "
                "Get a free key at https://aistudio.google.com/app/apikey"
            ),
        )
    return genai.Client(api_key=api_key)


def call_gemini(client, prompt: str) -> str:
    """Call Gemini and return the raw text response."""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {str(e)}"
        )


def extract_json_from_response(text: str) -> dict:
    """Extract a JSON object from a Gemini response that may contain markdown fences."""
    text = text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse AI response as JSON: {str(e)}. Raw: {text[:300]}"
        )


def extract_pdf_text(filepath: str) -> str:
    """Extract text content from a PDF file using PyPDF2."""
    if PyPDF2 is None:
        return "[PDF extraction unavailable — PyPDF2 not installed]"
    try:
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(pages).strip()
    except Exception as e:
        return f"[Could not extract PDF text: {str(e)}]"


# ─────────────────────────────────────────────────────────────
# 1. Resume Parsing
# ─────────────────────────────────────────────────────────────
@router.post(
    "/parse-resume",
    summary="🤖 AI: Parse your resume and extract structured data",
    response_model=AIResumeParseResult,
)
def parse_my_resume(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Extracts structured information from your uploaded PDF resume using Gemini AI.
    Returns skills, work experience, education, certifications, and languages.
    The result is stored and shown on your profile.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first (/students/resume)")

    resume = profile.resume
    if not os.path.exists(resume.filepath):
        raise HTTPException(status_code=404, detail="Resume file not found on disk")

    pdf_text = extract_pdf_text(resume.filepath)
    if not pdf_text or len(pdf_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract text from the PDF. Ensure it is a text-based (not scanned) PDF."
        )

    client = get_gemini_client()
    prompt = f"""
You are an expert resume parser for a student placement platform.
Analyze the following resume text and extract structured information.
Return ONLY a valid JSON object with this exact structure (no other text):

{{
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "company": "...",
      "role": "...",
      "duration": "...",
      "description": "..."
    }}
  ],
  "education": [
    {{
      "institution": "...",
      "degree": "...",
      "field": "...",
      "year": "...",
      "cgpa_or_percentage": "..."
    }}
  ],
  "certifications": ["cert1", "cert2"],
  "languages": ["English", "Hindi"],
  "summary": "A one-paragraph professional summary of this candidate"
}}

Resume Text:
---
{pdf_text[:6000]}
---
"""

    raw = call_gemini(client, prompt)
    data = extract_json_from_response(raw)

    # Persist parsed data
    resume.ai_parsed_data = data
    resume.is_parsed = True

    # Auto-update student skills if not already set
    if not profile.skills and data.get("skills"):
        profile.skills = data["skills"]

    db.commit()
    return AIResumeParseResult(**data)


# ─────────────────────────────────────────────────────────────
# 2. Candidate Ranking (Recruiter)
# ─────────────────────────────────────────────────────────────
@router.post(
    "/rank-candidates/{job_id}",
    summary="🤖 AI: Rank all applicants for a job by match score",
    response_model=AIRankResult,
)
def rank_candidates(
    job_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """
    Uses Gemini AI to rank all applicants for a given job.
    Each candidate receives a match score (0–100) and reasoning.
    Scores are saved to the database for future reference.
    """
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    applications = job.applications
    if not applications:
        raise HTTPException(status_code=404, detail="No applicants for this job yet")

    # Build candidate summaries for the prompt
    candidate_info = []
    for app in applications:
        s = app.student
        info = {
            "application_id": app.id,
            "student_id": s.id,
            "name": s.full_name or "Unknown",
            "email": s.user.email if s.user else "",
            "college": s.college or "N/A",
            "degree": s.degree or "N/A",
            "cgpa": s.cgpa or "N/A",
            "graduation_year": s.graduation_year or "N/A",
            "skills": s.skills,
            "desired_roles": s.desired_roles,
            "resume_summary": (s.resume.ai_parsed_data or {}).get("summary", "No AI summary available") if s.resume else "No resume",
            "cover_note": app.cover_note or "None provided",
        }
        candidate_info.append(info)

    client = get_gemini_client()
    prompt = f"""
You are an expert technical recruiter AI. Rank the following candidates for the job below.
Return ONLY a valid JSON array (no other text) where each element is:
{{
  "application_id": "...",
  "score": <integer 0-100>,
  "reasoning": "2-3 sentence explanation of fit"
}}
Sort by score descending.

Job Title: {job.title}
Job Description: {job.description}
Required Skills: {json.dumps(job.required_skills)}
Preferred Roles: {json.dumps(job.preferred_roles)}
Experience Required: {job.experience_required or 'Not specified'}

Candidates:
{json.dumps(candidate_info, indent=2)}
"""

    raw = call_gemini(client, prompt)
    rankings_raw = extract_json_from_response(raw)
    if not isinstance(rankings_raw, list):
        rankings_raw = rankings_raw.get("rankings", rankings_raw.get("candidates", []))

    # Build a lookup map
    app_map = {app.id: app for app in applications}
    student_map = {app.id: app.student for app in applications}

    ranked_candidates = []
    for r in rankings_raw:
        app_id = r.get("application_id", "")
        score = float(r.get("score", 0))
        reasoning = r.get("reasoning", "")

        # Save score to DB
        if app_id in app_map:
            app_obj = app_map[app_id]
            app_obj.ai_match_score = score
            app_obj.ai_match_reasoning = reasoning

            s = student_map[app_id]
            ranked_candidates.append(AIRankedCandidate(
                student_id=s.id,
                full_name=s.full_name,
                email=s.user.email if s.user else "",
                college=s.college,
                cgpa=s.cgpa,
                skills=s.skills,
                ai_match_score=score,
                ai_match_reasoning=reasoning,
            ))

    db.commit()
    return AIRankResult(
        job_id=job.id,
        job_title=job.title,
        ranked_candidates=ranked_candidates,
    )


# ─────────────────────────────────────────────────────────────
# 3. Job Matching for Student
# ─────────────────────────────────────────────────────────────
@router.get(
    "/match-jobs",
    summary="🤖 AI: Get AI-recommended jobs based on your profile",
    response_model=AIJobMatchResult,
)
def match_jobs_for_student(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Analyzes the student's profile and resume to recommend best-fit active jobs.
    Returns top matches with match percentage and reasoning.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if not profile.skills and not profile.resume:
        raise HTTPException(
            status_code=422,
            detail="Please complete your profile (add skills) or upload and parse your resume first."
        )

    active_jobs = db.query(Job).filter(Job.is_active == True).all()
    if not active_jobs:
        raise HTTPException(status_code=404, detail="No active job listings available right now")

    resume_summary = ""
    if profile.resume and profile.resume.ai_parsed_data:
        resume_summary = profile.resume.ai_parsed_data.get("summary", "")

    job_list = [
        {
            "job_id": j.id,
            "title": j.title,
            "company": j.recruiter.company_name if j.recruiter else "N/A",
            "description": j.description[:400],
            "required_skills": j.required_skills,
            "preferred_roles": j.preferred_roles,
        }
        for j in active_jobs
    ]

    client = get_gemini_client()
    prompt = f"""
You are an AI career advisor for a student placement platform.
Match the student below to the best-fit jobs from the provided list.
Return ONLY a valid JSON array (top 5 max, sorted by match_score desc), no other text:
[
  {{
    "job_id": "...",
    "match_score": <integer 0-100>,
    "match_reasoning": "2-3 sentence explanation",
    "missing_skills": ["skill1", "skill2"]
  }}
]

Student Profile:
- Skills: {json.dumps(profile.skills)}
- Desired Roles: {json.dumps(profile.desired_roles)}
- Degree: {profile.degree or 'N/A'}, Branch: {profile.branch or 'N/A'}
- CGPA: {profile.cgpa or 'N/A'}
- Resume Summary: {resume_summary or 'Not available'}

Available Jobs:
{json.dumps(job_list, indent=2)}
"""

    raw = call_gemini(client, prompt)
    matches_raw = extract_json_from_response(raw)
    if not isinstance(matches_raw, list):
        matches_raw = matches_raw.get("matches", matches_raw.get("jobs", []))

    job_lookup = {j.id: j for j in active_jobs}
    recommended = []
    for m in matches_raw:
        jid = m.get("job_id", "")
        job_obj = job_lookup.get(jid)
        if not job_obj:
            continue
        recommended.append(AIJobMatch(
            job_id=jid,
            job_title=job_obj.title,
            company_name=job_obj.recruiter.company_name if job_obj.recruiter else None,
            match_score=float(m.get("match_score", 0)),
            match_reasoning=m.get("match_reasoning", ""),
            missing_skills=m.get("missing_skills", []),
        ))

    return AIJobMatchResult(student_id=profile.id, recommended_jobs=recommended)


# ─────────────────────────────────────────────────────────────
# 4. Professional Summary Generator
# ─────────────────────────────────────────────────────────────
@router.post(
    "/generate-summary",
    summary="🤖 AI: Generate a professional recruiter-facing summary",
    response_model=AISummaryResult,
)
def generate_summary(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Generates a polished, professional paragraph summary of the student
    suitable for recruiters. The summary is saved to the student's profile.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    resume_data = {}
    if profile.resume and profile.resume.ai_parsed_data:
        resume_data = profile.resume.ai_parsed_data

    client = get_gemini_client()
    prompt = f"""
You are a professional career consultant. Write a compelling 3-4 sentence professional summary
for this student that would impress a recruiter. Be specific, use their actual skills and background.
Return ONLY the summary paragraph as plain text, no JSON, no markdown.

Student Details:
- Name: {profile.full_name or 'Student'}
- College: {profile.college or 'N/A'}
- Degree: {profile.degree or 'N/A'}, Branch: {profile.branch or 'N/A'}
- Graduation Year: {profile.graduation_year or 'N/A'}
- CGPA: {profile.cgpa or 'N/A'}
- Skills: {', '.join(profile.skills) or 'Not listed'}
- Desired Roles: {', '.join(profile.desired_roles) or 'Open to opportunities'}
- Experience: {json.dumps(resume_data.get('experience', []))}
- Certifications: {json.dumps(resume_data.get('certifications', []))}
- Bio: {profile.bio or 'N/A'}
"""

    raw = call_gemini(client, prompt)
    summary_text = raw.strip()

    # Save to profile
    profile.ai_summary = summary_text
    db.commit()

    return AISummaryResult(student_id=profile.id, summary=summary_text)


# ─────────────────────────────────────────────────────────────
# 5. Skill Gap Analysis
# ─────────────────────────────────────────────────────────────
@router.get(
    "/skill-gap/{job_id}",
    summary="🤖 AI: Identify skill gaps between you and a job requirement",
    response_model=AISkillGapResult,
)
def skill_gap_analysis(
    job_id: str,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Compares the student's current skills against a job's requirements.
    Returns matching skills, missing skills, a match percentage, and
    AI-suggested learning resources for the skill gaps.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student_skills = [s.lower() for s in profile.skills]
    required_skills = job.required_skills

    # Basic matching
    matching = [s for s in required_skills if s.lower() in student_skills]
    missing = [s for s in required_skills if s.lower() not in student_skills]
    match_pct = (len(matching) / len(required_skills) * 100) if required_skills else 0.0

    learning_suggestions = []
    if missing:
        client = get_gemini_client()
        prompt = f"""
You are a career coach. For each missing skill below, suggest a specific, actionable learning resource.
Return ONLY a valid JSON array, no other text:
[
  {{
    "skill": "...",
    "resource": "...",
    "url": "https://..."
  }}
]

Missing skills: {json.dumps(missing)}
Job role context: {job.title}
"""
        try:
            raw = call_gemini(client, prompt)
            learning_suggestions = extract_json_from_response(raw)
            if not isinstance(learning_suggestions, list):
                learning_suggestions = []
        except Exception:
            learning_suggestions = []

    return AISkillGapResult(
        student_id=profile.id,
        job_id=job.id,
        job_title=job.title,
        student_skills=profile.skills,
        required_skills=required_skills,
        matching_skills=matching,
        missing_skills=missing,
        match_percentage=round(match_pct, 1),
        learning_suggestions=learning_suggestions,
    )
