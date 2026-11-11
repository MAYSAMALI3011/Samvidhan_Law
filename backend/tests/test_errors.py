import pytest


@pytest.mark.asyncio
async def test_error_shape_on_404(client):
    response = await client.get("/api/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "message" in data
    assert isinstance(data["message"], str)


@pytest.mark.asyncio
async def test_error_shape_on_validation_failure(client):
    # Invalid password format on signup
    payload = {
        "name": "Test User",
        "email": "not-an-email",
        "password": "123",
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "message" in data
    assert "errors" in data
