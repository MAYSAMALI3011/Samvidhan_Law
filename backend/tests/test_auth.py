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
