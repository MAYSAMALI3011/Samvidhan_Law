from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    interests: List[str] = Field(default_factory=list)
    role: str = "learner"  # 'learner' | 'editor' | 'reviewer' | 'admin' | 'superadmin'
    tier: str = "free"     # 'free' | 'pro' | 'patron'
    aiUsageToday: int = 0
    status: Optional[str] = "Active"
    referralCode: Optional[str] = None


class UserSettings(BaseModel):
    dailyGoal: int = 30
    soundEnabled: bool = True
    mascotEnabled: bool = True
    reduceMotion: bool = False
    compact: bool = False


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    interests: Optional[List[str]] = None


class UpdateSettingsRequest(BaseModel):
    dailyGoal: Optional[int] = Field(None, ge=5, le=500)
    soundEnabled: Optional[bool] = None
    mascotEnabled: Optional[bool] = None
    reduceMotion: Optional[bool] = None
    compact: Optional[bool] = None
