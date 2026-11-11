from typing import List, Optional
from fastapi import Depends, HTTPException, Request, Response, status
from app.config import settings
from app.security import (
    extract_token_from_request,
    set_auth_cookies,
    verify_csrf_origin,
)
from app.schemas.user import UserProfile
from app.supabase_client import (
    get_supabase_admin_client,
    refresh_user_token,
    verify_user_token,
)


async def get_current_user_optional(
    request: Request,
    response: Response,
) -> Optional[UserProfile]:
    token, source = extract_token_from_request(request)
    if not token:
        return None

    # Enforce CSRF if authenticated via cookies on state-modifying requests
    if source == "cookie" and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        if settings.CSRF_STRICT and not verify_csrf_origin(request, settings.allowed_origins_list):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF origin validation failed",
            )

    user_info = await verify_user_token(token)

    # Attempt automatic refresh if access token expired and refresh cookie exists
    if not user_info and source == "cookie":
        refresh_token = request.cookies.get("sb_refresh")
        if refresh_token:
            new_tokens = await refresh_user_token(refresh_token)
            if new_tokens:
                new_access, new_refresh = new_tokens
                user_info = await verify_user_token(new_access)
                if user_info:
                    set_auth_cookies(response, new_access, new_refresh)

    if not user_info:
        return None

    user_id = user_info.get("id")
    email = user_info.get("email") or ""
    raw_meta = user_info.get("user_metadata", {})
    name = raw_meta.get("name", email.split("@")[0] if "@" in email else "Learner")

    # Fetch extended profile & tier from database using service role client
    role = "learner"
    tier = "free"
    interests: List[str] = []
    status_str = "Active"
    referral_code = None
    ai_usage_today = 0

    supabase = get_supabase_admin_client()
    if supabase and user_id:
        try:
            prof_res = supabase.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
            if prof_res and prof_res.data:
                pdata = prof_res.data
                name = pdata.get("name") or name
                role = pdata.get("role") or role
                interests = pdata.get("interests") or interests
                status_str = pdata.get("status") or status_str
                referral_code = pdata.get("referral_code")

            sub_res = supabase.table("subscriptions").select("tier").eq("user_id", user_id).maybe_single().execute()
            if sub_res and sub_res.data:
                tier = sub_res.data.get("tier") or tier

            usage_res = supabase.table("ai_usage").select("count").eq("user_id", user_id).eq("day", "CURRENT_DATE").maybe_single().execute()
            if usage_res and usage_res.data:
                ai_usage_today = usage_res.data.get("count", 0)
        except Exception:
            pass

    return UserProfile(
        id=user_id,
        name=name,
        email=email,
        interests=interests,
        role=role,
        tier=tier,
        aiUsageToday=ai_usage_today,
        status=status_str,
        referralCode=referral_code,
    )


async def get_current_user(
    user: Optional[UserProfile] = Depends(get_current_user_optional),
) -> UserProfile:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or unauthorized. Please log in again.",
        )
    return user


def require_role(allowed_roles: List[str]):
    async def role_checker(user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return user
    return role_checker
