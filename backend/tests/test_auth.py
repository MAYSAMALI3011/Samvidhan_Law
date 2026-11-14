import pytest
import respx
import httpx
from app.config import settings


@pytest.mark.asyncio
@respx.mock
async def test_signup_success(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/signup").mock(
        return_value=httpx.Response(200, json={"id": "usr-123", "email": "test@example.com"})
    )

    payload = {
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "password": "ValidPassword@123",
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["name"] == "Aarav Sharma"
    assert data["user"]["email"] == "aarav@example.com"


@pytest.mark.asyncio
@respx.mock
async def test_signup_duplicate_email(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/signup").mock(
        return_value=httpx.Response(400, json={"msg": "User already registered"})
    )

    payload = {
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "password": "ValidPassword@123",
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert "already exists" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_login_success_sets_cookies(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password").mock(
        return_value=httpx.Response(
            200,
            json={
                "access_token": "mock-access-token-123",
                "refresh_token": "mock-refresh-token-123",
                "user": {"id": "usr-123", "user_metadata": {"name": "Aarav"}},
            },
        )
    )

    payload = {"email": "aarav@example.com", "password": "ValidPassword@123"}
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["token"] == "mock-access-token-123"
    assert "sb_access" in response.cookies
    assert "sb_refresh" in response.cookies


@pytest.mark.asyncio
@respx.mock
async def test_login_invalid_credentials_returns_401(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password").mock(
        return_value=httpx.Response(400, json={"error_description": "Invalid login credentials"})
    )

    payload = {"email": "aarav@example.com", "password": "WrongPassword@123"}
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["message"] == "Invalid email or password."


@pytest.mark.asyncio
@respx.mock
async def test_get_me_returns_profile_directly(client):
    respx.get(f"{settings.SUPABASE_URL}/auth/v1/user").mock(
        return_value=httpx.Response(
            200,
            json={"id": "usr-123", "email": "aarav@example.com", "user_metadata": {"name": "Aarav"}},
        )
    )

    headers = {"Authorization": "Bearer valid-token-xyz"}
    response = await client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Contract: UserProfile object directly (not wrapped in { user: ... })
    assert data["id"] == "usr-123"
    assert data["email"] == "aarav@example.com"
    assert data["name"] == "Aarav"
    assert "tier" in data
    assert "role" in data


@pytest.mark.asyncio
async def test_logout_clears_cookies(client):
    response = await client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"success": True}


@pytest.mark.asyncio
@respx.mock
async def test_verify_otp_success_sets_cookies(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/verify").mock(
        return_value=httpx.Response(
            200,
            json={
                "access_token": "mock-access-token-456",
                "refresh_token": "mock-refresh-token-456",
                "user": {"id": "usr-456", "email": "aarav@example.com", "user_metadata": {"name": "Aarav"}},
            },
        )
    )

    payload = {"email": "  AARAV@EXAMPLE.COM  ", "code": "123456"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["token"] == "mock-access-token-456"
    assert data["user"]["email"] == "aarav@example.com"
    assert "sb_access" in response.cookies


@pytest.mark.asyncio
@respx.mock
async def test_verify_otp_expired_code_mapping(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/verify").mock(
        return_value=httpx.Response(400, json={"error_description": "Token is expired or invalid"})
    )

    payload = {"email": "aarav@example.com", "code": "654321"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "expired" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_verify_otp_invalid_code_mapping(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/verify").mock(
        return_value=httpx.Response(400, json={"error_description": "Invalid token"})
    )

    payload = {"email": "aarav@example.com", "code": "000000"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "invalid verification code" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_verify_otp_already_confirmed_mapping(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/verify").mock(
        return_value=httpx.Response(400, json={"msg": "Email link is invalid or has already been verified"})
    )

    payload = {"email": "aarav@example.com", "code": "112233"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "already verified" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_verify_otp_rate_limited(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/verify").mock(
        return_value=httpx.Response(429, json={"msg": "Too many requests"})
    )

    payload = {"email": "aarav@example.com", "code": "999999"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code == 429
    data = response.json()
    assert data["success"] is False
    assert "too many" in data["message"].lower()


@pytest.mark.asyncio
async def test_verify_otp_requires_6_digits(client):
    # Non-6-digit input should be rejected by pydantic validator
    payload = {"email": "aarav@example.com", "code": "123"}
    response = await client.post("/api/auth/verify-otp", json=payload)
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
@respx.mock
async def test_resend_otp_success_without_enumeration(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/resend").mock(
        return_value=httpx.Response(200, json={})
    )

    payload = {"email": "aarav@example.com"}
    response = await client.post("/api/auth/resend-otp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "if an account exists" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_resend_otp_rate_limited_clear_message(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/resend").mock(
        return_value=httpx.Response(429, json={"msg": "Email rate limit exceeded"})
    )

    payload = {"email": "aarav@example.com"}
    response = await client.post("/api/auth/resend-otp", json=payload)
    assert response.status_code == 429
    data = response.json()
    assert data["success"] is False
    assert "too many emails requested, try again in about an hour" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_login_unverified_email_returns_clear_message(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password").mock(
        return_value=httpx.Response(400, json={"error_description": "Email not confirmed"})
    )

    payload = {"email": "aarav@example.com", "password": "ValidPassword@123"}
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "please verify your email first" in data["message"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_login_rate_limited_returns_clear_message(client):
    respx.post(f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password").mock(
        return_value=httpx.Response(429, json={"error_description": "Rate limit exceeded"})
    )

    payload = {"email": "aarav@example.com", "password": "ValidPassword@123"}
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 429
    data = response.json()
    assert data["success"] is False
    assert "too many login attempts" in data["message"].lower()


@pytest.mark.asyncio
async def test_get_me_unauthenticated_returns_401(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401

