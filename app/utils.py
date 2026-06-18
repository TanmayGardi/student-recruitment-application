from pwdlib import PasswordHash
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 30        # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key-change-in-production-32chars")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "super-secret-refresh-key-change-in-production-32c")

password_hasher = PasswordHash.recommended()


def get_hashed_password(password: str) -> str:
    """Takes a plain password and returns a secure hash."""
    return password_hasher.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    """Verifies a plain password against its stored hash."""
    return password_hasher.verify(password, hashed_pass)


def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    """Creates a short-lived JWT access token."""
    if expires_delta is not None:
        expires = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expires = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires, "sub": str(subject)}
    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM)


def create_refresh_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    """Creates a long-lived JWT refresh token."""
    if expires_delta is not None:
        expires = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expires = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires, "sub": str(subject)}
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, ALGORITHM)


def decode_refresh_token(token: str) -> str:
    """Decodes a refresh token and returns the email (subject)."""
    from jose import JWTError
    from fastapi import HTTPException, status
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        return email
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")