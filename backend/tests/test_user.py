import pytest
import respx
import httpx
from app.config import settings


@pytest.mark.asyncio
@respx.mock
async def test_get_and_patch_user_profile(client):
    respx.get(f"{settings.SUPABASE_URL}/auth/v1/user").mock(
        return_value=httpx.Response(
            200,
            json={"id": "usr-123", "email": "aarav@example.com", "user_metadata": {"name": "Aarav"}},
        )
    )

    headers = {"Authorization": "Bearer valid-token-xyz"}
    
    # 1. Get profile
    res_get = await client.get("/api/user/profile", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "Aarav"

    # 2. Patch profile
    patch_payload = {"name": "Aarav Sharma Updated", "interests": ["Constitutional Law", "Civic Rights"]}
    res_patch = await client.patch("/api/user/profile", json=patch_payload, headers=headers)
    assert res_patch.status_code == 200
    patched_data = res_patch.json()
    assert patched_data["name"] == "Aarav Sharma Updated"
    assert "Constitutional Law" in patched_data["interests"]


@pytest.mark.asyncio
@respx.mock
async def test_patch_user_settings(client):
    respx.get(f"{settings.SUPABASE_URL}/auth/v1/user").mock(
        return_value=httpx.Response(
            200,
            json={"id": "usr-123", "email": "aarav@example.com", "user_metadata": {"name": "Aarav"}},
        )
    )

    headers = {"Authorization": "Bearer valid-token-xyz"}
    patch_payload = {
        "dailyGoal": 45,
        "soundEnabled": False,
        "compact": True,
    }
    response = await client.patch("/api/user/settings", json=patch_payload, headers=headers)
    assert response.status_code == 200
    settings_data = response.json()
    assert settings_data["dailyGoal"] == 45
    assert settings_data["soundEnabled"] is False
    assert settings_data["compact"] is True
