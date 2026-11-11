import hashlib
from typing import List, Optional, Tuple
from fastapi import Request, Response
from urllib.parse import urlparse
from app.config import settings


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: Optional[str] = None,
) -> None:
    # sb_access lifetime: 1 hour (3600s)
    response.set_cookie(
        key="sb_access",
        value=access_token,
        max_age=3600,
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.COOKIE_SAMESITE.lower(),  # type: ignore
        path="/",
    )
    # sb_refresh lifetime: 30 days (2592000s)
    if refresh_token:
        response.set_cookie(
            key="sb_refresh",
            value=refresh_token,
            max_age=2592000,
            httponly=True,
            secure=settings.effective_cookie_secure,
            samesite=settings.COOKIE_SAMESITE.lower(),  # type: ignore
            path="/",
        )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(
        key="sb_access",
        path="/",
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.COOKIE_SAMESITE.lower(),  # type: ignore
    )
    response.delete_cookie(
        key="sb_refresh",
        path="/",
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.COOKIE_SAMESITE.lower(),  # type: ignore
    )


def extract_token_from_request(request: Request) -> Tuple[Optional[str], str]:
    """
    Returns (token, source) where source is 'bearer', 'cookie', or 'none'.
    Authorization: Bearer takes precedence over cookies.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token:
            return token, "bearer"

    cookie_token = request.cookies.get("sb_access")
    if cookie_token and cookie_token.strip():
        return cookie_token.strip(), "cookie"

    return None, "none"


def verify_csrf_origin(request: Request, allowed_origins: List[str]) -> bool:
    """
    CSRF verification for state-changing requests using cookie authentication.
    Validates Origin or Referer against allowed origins list.
    """
    origin = request.headers.get("origin")
    referer = request.headers.get("referer")

    candidate_origin = origin
    if not candidate_origin and referer:
        parsed = urlparse(referer)
        candidate_origin = f"{parsed.scheme}://{parsed.netloc}"

    if not candidate_origin:
        return False

    candidate_clean = candidate_origin.rstrip("/")
    for allowed in allowed_origins:
        if candidate_clean == allowed.rstrip("/"):
            return True

    return False


def hash_ip(ip: str, salt: str = "samvidhan-ai-ip-salt") -> str:
    """Hashes client IP with salt to avoid storing raw IP addresses."""
    return hashlib.sha256(f"{salt}:{ip}".encode("utf-8")).hexdigest()
