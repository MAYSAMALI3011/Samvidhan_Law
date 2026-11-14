import hashlib
import time
from typing import Any, Dict, Optional, Tuple
import httpx
from app.config import settings

# In-memory token verification cache: sha256(token) -> (expire_at, user_dict)
_token_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}


def get_token_cache_key(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def verify_user_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies token by calling GET {SUPABASE_URL}/auth/v1/user with the anon key.
    Works with both symmetric (HS256) and asymmetric JWT signing keys.
    Caches verified payloads for 30s.
    """
    if not token or not settings.SUPABASE_URL:
        return None

    cache_key = get_token_cache_key(token)
    now = time.time()
    if cache_key in _token_cache:
        expire_at, data = _token_cache[cache_key]
        if now < expire_at:
            return data
        del _token_cache[cache_key]

    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": settings.anon_key,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                user_data = res.json()
                _token_cache[cache_key] = (now + 30.0, user_data)
                return user_data
    except Exception:
        pass

    return None


async def refresh_user_token(refresh_token: str) -> Optional[Tuple[str, str]]:
    """
    Refreshes access token via POST {SUPABASE_URL}/auth/v1/token?grant_type=refresh_token.
    Returns (new_access_token, new_refresh_token) or None.
    """
    if not refresh_token or not settings.SUPABASE_URL:
        return None

    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=refresh_token"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    payload = {"refresh_token": refresh_token}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                access_token = data.get("access_token")
                new_refresh = data.get("refresh_token")
                if access_token:
                    return access_token, new_refresh or refresh_token
    except Exception:
        pass

    return None


async def call_gotrue_signup(name: str, email: str, password: str) -> Tuple[int, Dict[str, Any]]:
    clean_email = email.strip().lower()
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/signup"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    body = {
        "email": clean_email,
        "password": password,
        "data": {"name": name.strip()},
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, headers=headers, json=body)
        try:
            data = res.json() if res.content else {}
        except Exception:
            data = {"message": res.text}
        return res.status_code, data


async def call_gotrue_verify_otp(email: str, code: str) -> Tuple[int, Dict[str, Any]]:
    clean_email = email.strip().lower()
    clean_code = code.strip()
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/verify"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    # Attempt type "signup" first (standard Supabase email verification for signups)
    body = {
        "type": "signup",
        "token": clean_code,
        "email": clean_email,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, headers=headers, json=body)
        try:
            data = res.json() if res.content else {}
        except Exception:
            data = {"message": res.text}

        if res.status_code == 200:
            return res.status_code, data

        msg = (data.get("msg") or data.get("error_description") or data.get("message") or "").lower()
        if "expired" in msg or "already" in msg or "rate" in msg or res.status_code == 429:
            return res.status_code, data

        # Fallback attempt type "email" (supported by some GoTrue OTP configs)
        body["type"] = "email"
        try:
            res_email = await client.post(url, headers=headers, json=body)
            if res_email.status_code == 200:
                return res_email.status_code, res_email.json() if res_email.content else {}
        except Exception:
            pass

        return res.status_code, data


async def call_gotrue_resend_otp(email: str) -> Tuple[int, Dict[str, Any]]:
    if not settings.SUPABASE_URL:
        return 500, {"message": "Supabase URL not configured"}
    clean_email = email.strip().lower()
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/resend"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    body = {
        "type": "signup",
        "email": clean_email,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, headers=headers, json=body)
            try:
                data = res.json() if res.content else {}
            except Exception:
                data = {"message": res.text}
            return res.status_code, data
    except Exception as e:
        return 500, {"message": str(e)}


async def call_gotrue_login(email: str, password: str) -> Tuple[int, Dict[str, Any]]:
    clean_email = email.strip().lower()
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    body = {
        "email": clean_email,
        "password": password,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, headers=headers, json=body)
        try:
            data = res.json() if res.content else {}
        except Exception:
            data = {"message": res.text}
        return res.status_code, data


async def call_gotrue_recover(email: str) -> Tuple[int, Dict[str, Any]]:
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/recover"
    headers = {
        "apikey": settings.anon_key,
        "Content-Type": "application/json",
    }
    body = {
        "email": email,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, headers=headers, json=body)
        return res.status_code, (res.json() if res.content else {})


async def call_gotrue_logout(access_token: str) -> None:
    if not access_token or not settings.SUPABASE_URL:
        return
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/logout"
    headers = {
        "apikey": settings.anon_key,
        "Authorization": f"Bearer {access_token}",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, headers=headers)
    except Exception:
        pass


def get_supabase_admin_client():
    """
    Returns the Supabase service-role client for server-side database operations.
    """
    if not settings.SUPABASE_URL or not settings.service_role_key:
        return None
    if "placeholder" in settings.SUPABASE_URL.lower():
        return None
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.service_role_key)
