import os
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, StudentProfile, RecruiterProfile
from app.schemas import (
    UserAuth, UserOut, TokenSchema, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.utils import (
    get_hashed_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.dependencies import get_current_user
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─────────────────────────────────────────────────────────────
# Email / Password Auth
# ─────────────────────────────────────────────────────────────
@router.post(
    "/signup",
    summary="Register a new user (student or recruiter)",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
def signup(data: UserAuth, db: Session = Depends(get_db)):
    """Register a new user with a role of either 'student' or 'recruiter'."""
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="This username is already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=get_hashed_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.flush()

    if data.role == "student":
        db.add(StudentProfile(user_id=user.id))
    else:
        db.add(RecruiterProfile(user_id=user.id))

    db.commit()
    db.refresh(user)
    return user


@router.post("/login", summary="Login and get access + refresh tokens", response_model=TokenSchema)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate using email + password and receive JWT tokens."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return {
        "access_token": create_access_token(user.email),
        "refresh_token": create_refresh_token(user.email),
    }


@router.post("/refresh", summary="Refresh access token", response_model=TokenSchema)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    email = decode_refresh_token(body.refresh_token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "access_token": create_access_token(user.email),
        "refresh_token": create_refresh_token(user.email),
    }


@router.get("/me", summary="Get currently authenticated user info", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ─────────────────────────────────────────────────────────────
# Google OAuth
# ─────────────────────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    credential: str          # Google ID token from frontend
    role: Optional[str] = "student"   # only used for first-time sign-up


@router.post("/google", summary="Sign in / sign up with Google", response_model=TokenSchema)
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Verify a Google ID token issued by the frontend (via Google Identity Services).
    - If the user already exists → log them in.
    - If new → auto-register with the provided role.
    Returns JWT tokens exactly like the /login endpoint.
    """
    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    if not google_client_id or google_client_id == "YOUR_GOOGLE_CLIENT_ID_HERE":
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Sign-In is not configured. "
                "Add GOOGLE_CLIENT_ID to your .env file. "
                "Get one at https://console.cloud.google.com/apis/credentials"
            ),
        )

    # Verify the Google credential
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        idinfo = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            google_client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    email = idinfo.get("email")
    name = idinfo.get("name", "")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Find or create the user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # New user — register them
        role = body.role if body.role in ("student", "recruiter") else "student"
        username_base = email.split("@")[0].replace(".", "_").replace("-", "_")
        username = username_base
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{username_base}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            hashed_password=get_hashed_password(os.urandom(32).hex()),  # random — can't log in with password
            role=role,
        )
        db.add(user)
        db.flush()

        # Create profile and pre-fill name
        if role == "student":
            profile = StudentProfile(user_id=user.id, full_name=name)
            db.add(profile)
        else:
            profile = RecruiterProfile(user_id=user.id, full_name=name)
            db.add(profile)

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    return {
        "access_token": create_access_token(user.email),
        "refresh_token": create_refresh_token(user.email),
    }


@router.post(
    "/forgot-password",
    summary="Request a password reset link",
)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a secure reset token valid for 15 minutes, saves it, and returns the reset link (mocking email)."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address")
    
    # Generate token
    token = str(uuid.uuid4())
    expiration = datetime.utcnow() + timedelta(minutes=15)
    
    user.reset_token = token
    user.reset_token_expires = expiration
    db.commit()
    
    # Log it to reset_links.log for demo/testing
    log_file = "reset_links.log"
    reset_link = f"http://localhost:8000/?reset_token={token}"
    
    with open(log_file, "a") as f:
        f.write(f"[{datetime.utcnow().isoformat()}] Password reset request for {user.email}: {reset_link}\n")
        
    return {
        "message": "Password reset link generated successfully. (Demo mode: link returned below & written to reset_links.log)",
        "reset_token": token,
        "reset_link": reset_link
    }


@router.post(
    "/reset-password",
    summary="Reset password using reset token",
)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verifies the token and resets the user's password."""
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    # Check expiration
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")
        
    # Reset password
    user.hashed_password = get_hashed_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password has been reset successfully. You can now log in with your new password."}

