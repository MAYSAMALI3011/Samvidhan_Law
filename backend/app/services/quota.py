from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple
from app.config import settings
from app.schemas.user import UserProfile
from app.supabase_client import get_supabase_admin_client

# In-memory quota fallback when database is not connected
_guest_usage_mem: Dict[str, Dict[str, int]] = {}
_user_usage_mem: Dict[str, Dict[str, int]] = {}


def get_utc_today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def seconds_until_utc_midnight() -> int:
    now = datetime.now(timezone.utc)
    # Target next midnight
    midnight = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    diff = int((midnight - now).total_seconds()) + 1
    return max(diff, 1)


def check_and_get_quota(
    user: Optional[UserProfile],
    ip_hash: str,
) -> Tuple[bool, Dict[str, Any]]:
    """
    Evaluates daily quota before calling AI providers.
    Returns (is_allowed, quota_info_dict).
    """
    today = get_utc_today_str()
    retry_after = seconds_until_utc_midnight()

    if user:
        if user.tier in ["pro", "patron"]:
            return True, {
                "success": True,
                "currentTier": user.tier,
                "dailyLimit": None,
                "usageToday": user.aiUsageToday,
                "retryAfter": 0,
            }

        # Free tier user limit
        limit = settings.FREE_DAILY_AI_LIMIT
        usage_today = user.aiUsageToday

        supabase = get_supabase_admin_client()
        if supabase:
            try:
                res = supabase.table("ai_usage").select("count").eq("user_id", user.id).eq("day", today).maybe_single().execute()
                if res and res.data:
                    usage_today = res.data.get("count", 0)
            except Exception:
                usage_today = _user_usage_mem.get(user.id, {}).get(today, 0)
        else:
            usage_today = _user_usage_mem.get(user.id, {}).get(today, 0)

        if usage_today >= limit:
            return False, {
                "success": False,
                "message": f"Daily AI question limit reached ({limit}/{limit}). You can continue exploring lessons and library documents.",
                "retryAfter": retry_after,
                "currentTier": user.tier,
                "dailyLimit": limit,
                "usageToday": usage_today,
            }

        return True, {
            "success": True,
            "currentTier": user.tier,
            "dailyLimit": limit,
            "usageToday": usage_today,
            "retryAfter": 0,
        }

    # Guest user quota
    limit = settings.GUEST_DAILY_AI_LIMIT
    guest_usage = 0

    supabase = get_supabase_admin_client()
    if supabase:
        try:
            res = supabase.table("ai_guest_usage").select("count").eq("ip_hash", ip_hash).eq("day", today).maybe_single().execute()
            if res and res.data:
                guest_usage = res.data.get("count", 0)
        except Exception:
            guest_usage = _guest_usage_mem.get(ip_hash, {}).get(today, 0)
    else:
        guest_usage = _guest_usage_mem.get(ip_hash, {}).get(today, 0)

    if guest_usage >= limit:
        return False, {
            "success": False,
            "message": f"Daily free guest question limit reached ({limit}/{limit}). Sign in or create a free account for higher daily usage.",
            "retryAfter": retry_after,
            "currentTier": "free",
            "dailyLimit": limit,
            "usageToday": guest_usage,
        }

    return True, {
        "success": True,
        "currentTier": "free",
        "dailyLimit": limit,
        "usageToday": guest_usage,
        "retryAfter": 0,
    }


def increment_quota_on_success(
    user: Optional[UserProfile],
    ip_hash: str,
) -> None:
    """
    Called ONLY when an AI provider successfully generated an answer.
    Never called for default fallback answer or failed attempts.
    """
    today = get_utc_today_str()
    supabase = get_supabase_admin_client()

    if user:
        if supabase:
            try:
                # Upsert increment in database
                supabase.rpc("increment_ai_usage", {"p_user_id": user.id, "p_day": today}).execute()
            except Exception:
                # Fallback to direct upsert or memory
                user_counts = _user_usage_mem.setdefault(user.id, {})
                user_counts[today] = user_counts.get(today, 0) + 1
        else:
            user_counts = _user_usage_mem.setdefault(user.id, {})
            user_counts[today] = user_counts.get(today, 0) + 1
    else:
        if supabase:
            try:
                supabase.rpc("increment_ai_guest_usage", {"p_ip_hash": ip_hash, "p_day": today}).execute()
            except Exception:
                guest_counts = _guest_usage_mem.setdefault(ip_hash, {})
                guest_counts[today] = guest_counts.get(today, 0) + 1
        else:
            guest_counts = _guest_usage_mem.setdefault(ip_hash, {})
            guest_counts[today] = guest_counts.get(today, 0) + 1
