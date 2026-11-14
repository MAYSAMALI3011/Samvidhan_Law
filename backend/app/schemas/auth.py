import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.user import UserProfile


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        # Matches frontend authValidation.ts rules:
        # min 8 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 special char
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must include at least one number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must include at least one special character")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("Verification code must be exactly 6 digits.")
        return v


class ResendOtpRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=8, max_length=128)

    @field_validator("newPassword")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must include at least one number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must include at least one special character")
        return v


class AuthSuccessResponse(BaseModel):
    success: bool = True
    user: Optional[UserProfile] = None
    token: Optional[str] = None
    message: Optional[str] = None
