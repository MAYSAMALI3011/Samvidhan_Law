import os
import pytest
from httpx import ASGITransport, AsyncClient

# Set testing environment variables before importing app
os.environ["APP_ENV"] = "development"
os.environ["SUPABASE_URL"] = "https://test-supabase-project.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "test-anon-key-12345"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-service-role-key-12345"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173,https://maysamali3011.github.io"
os.environ["OPENROUTER_MODEL"] = "test/model:free"

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
