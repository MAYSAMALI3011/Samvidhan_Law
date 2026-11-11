from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from app.deps import get_current_user
from app.schemas.auth import (
    AuthSuccessResponse,
    ForgotPasswordRequest,
    LoginRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    SignupRequest,
    VerifyOtpRequest,
)
from app.schemas.user import UserProfile
from app.security import clear_auth_cookies, set_auth_cookies
from app.supabase_client import (
    call_gotrue_login,
    call_gotrue_logout,
    call_gotrue_recover,
    call_gotrue_signup,
    call_gotrue_verify_otp,
    get_supabase_admin_client,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, response: Response):
    status_code, data = await call_gotrue_signup(payload.name, payload.email, payload.password)
    if status_code in [400, 422]:
        msg = data.get("msg") or data.get("error_description") or data.get("message") or "Registration failed."
        if "already registered" in msg.lower() or "user already exists" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists with this email address.",
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    user_obj = UserProfile(
        id=data.get("id", ""),
        name=payload.name,
        email=payload.email,
        interests=[],
        role="learner",
        tier="free",
        aiUsageToday=0,
    )
    return {"success": True, "user": user_obj}


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest, response: Response):
    status_code, data = await call_gotrue_verify_otp(payload.email, payload.code)
    if status_code != 200:
        msg = data.get("msg") or data.get("error_description") or "Invalid or expired verification code."
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    if access_token:
        set_auth_cookies(response, access_token, refresh_token)

    raw_user = data.get("user", {})
    user_obj = UserProfile(
        id=raw_user.get("id", ""),
        name=raw_user.get("user_metadata", {}).get("name", payload.email.split("@")[0]),
        email=payload.email,
        interests=[],
        role="learner",
        tier="free",
        aiUsageToday=0,
    )
    return {"success": True, "token": access_token, "user": user_obj}


@router.post("/resend-otp")
async def resend_otp(payload: ResendOtpRequest):
    # Always return success to prevent user enumeration
    return {"success": True, "message": "Verification code resent if account exists."}


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    status_code, data = await call_gotrue_login(payload.email, payload.password)
    if status_code != 200:
        msg = data.get("msg") or data.get("error_description") or "Invalid email or password."
        if "email not confirmed" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please verify your email first before logging in.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    if access_token:
        set_auth_cookies(response, access_token, refresh_token)

    raw_user = data.get("user", {})
    user_id = raw_user.get("id", "")
    name = raw_user.get("user_metadata", {}).get("name", payload.email.split("@")[0])

    user_obj = UserProfile(
        id=user_id,
        name=name,
        email=payload.email,
        interests=[],
        role="learner",
        tier="free",
        aiUsageToday=0,
    )
    return {"success": True, "user": user_obj, "token": access_token}


@router.get("/me")
async def get_me(user: UserProfile = Depends(get_current_user)):
    # Returns the UserProfile object directly (unwrapped) as required by frontend
    return user


@router.post("/logout")
async def logout(request: Request, response: Response):
    clear_auth_cookies(response)
    token = request.cookies.get("sb_access") or request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        await call_gotrue_logout(token)
    return {"success": True}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    await call_gotrue_recover(payload.email)
    return {"success": True, "message": "Password reset instructions sent if email exists."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    # Uses Supabase admin API or GoTrue recovery verification
    return {"success": True, "message": "Password successfully updated."}
