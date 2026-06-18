"""
FastAPI Student Placement & Recruitment Platform
================================================
A production-ready placement portal with JWT authentication, role-based access,
and AI-powered features via Google Gemini.

Roles:
  - student   → upload resume, apply to jobs, get AI job recommendations
  - recruiter → post jobs, search students, AI-rank candidates

Run with:
    uvicorn app.app:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.database import engine, Base
from app.routers import auth, students, recruiters, jobs, ai

# ── Create all database tables on startup ──────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="🎓 Student Placement & Recruitment Platform",
    description="""
## Welcome to the AI-Powered Placement Portal 🚀

### For Students
- **Register** as a student and build your profile
- **Upload** your PDF resume — our AI will parse and extract your skills automatically
- **Browse** job listings and apply with a cover note
- **Get AI recommendations** for the best-fit jobs
- **Identify skill gaps** between your profile and any job requirement
- **Generate** a professional recruiter-facing summary with AI

### For Recruiters
- **Register** as a recruiter and set up your company profile
- **Post** detailed job listings with required skills and role preferences
- **Search & filter** students by skills, CGPA, college, graduation year
- **AI-rank** all applicants for a job — get a 0–100 match score with reasoning
- **Manage** applicant statuses (shortlist, reject, hire)

### Authentication
All protected endpoints require a Bearer token in the `Authorization` header.
Use the **Authorize** button (🔒) in Swagger UI and enter your token.

### AI Features (requires `GEMINI_API_KEY` in `.env`)
Get a free key at https://aistudio.google.com/app/apikey
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Placement Platform",
        "url": "https://github.com",
    },
)

# ── CORS Middleware ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(recruiters.router)
app.include_router(jobs.router)
app.include_router(ai.router)


# ── Root Redirect ──────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    """Redirect root to Swagger UI."""
    return RedirectResponse(url="/docs")


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
def health_check():
    """Returns service health status."""
    return {"status": "healthy", "service": "Placement Platform API", "version": "1.0.0"}
