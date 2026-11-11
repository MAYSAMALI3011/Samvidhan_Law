from fastapi import APIRouter, Depends
from app.deps import get_current_user
from app.schemas.user import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    UserProfile,
    UserSettings,
)
from app.supabase_client import get_supabase_admin_client

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile")
async def get_profile(user: UserProfile = Depends(get_current_user)):
    return user


@router.patch("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    user: UserProfile = Depends(get_current_user),
):
    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name
        user.name = payload.name
    if payload.interests is not None:
        updates["interests"] = payload.interests
        user.interests = payload.interests

    supabase = get_supabase_admin_client()
    if supabase and updates:
        try:
            supabase.table("profiles").update(updates).eq("id", user.id).execute()
        except Exception:
            pass

    return user


@router.patch("/settings")
async def update_settings(
    payload: UpdateSettingsRequest,
    user: UserProfile = Depends(get_current_user),
):
    settings_obj = UserSettings()
    supabase = get_supabase_admin_client()

    updates = {}
    if payload.dailyGoal is not None:
        updates["daily_goal"] = payload.dailyGoal
        settings_obj.dailyGoal = payload.dailyGoal
    if payload.soundEnabled is not None:
        updates["sound_enabled"] = payload.soundEnabled
        settings_obj.soundEnabled = payload.soundEnabled
    if payload.mascotEnabled is not None:
        updates["mascot_enabled"] = payload.mascotEnabled
        settings_obj.mascotEnabled = payload.mascotEnabled
    if payload.reduceMotion is not None:
        updates["reduce_motion"] = payload.reduceMotion
        settings_obj.reduceMotion = payload.reduceMotion
    if payload.compact is not None:
        updates["compact"] = payload.compact
        settings_obj.compact = payload.compact

    if supabase and updates:
        try:
            supabase.table("user_settings").update(updates).eq("user_id", user.id).execute()
        except Exception:
            pass

    return settings_obj
