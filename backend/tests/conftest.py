import os
import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import MagicMock

# Force fake test environment
os.environ["APP_ENV"] = "testing"
os.environ["SUPABASE_URL"] = "https://mock-test-project.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-role-key"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"
os.environ["OPENROUTER_MODEL"] = "google/gemini-flash:free"
os.environ["GROQ_API_KEY"] = "mock-groq-key"
os.environ["GEMINI_API_KEY"] = "mock-gemini-key"

from app.main import app
import app.services.quota as quota_mod

@pytest.fixture(autouse=True)
def mock_all_network_and_reset_state(monkeypatch):
    quota_mod._guest_usage_mem.clear()
    quota_mod._user_usage_mem.clear()
    
    # Mock supabase client globally to a mock that returns empty data without network calls
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = None
    
    monkeypatch.setattr("app.supabase_client.get_supabase_admin_client", lambda: mock_supabase)
    monkeypatch.setattr("app.routers.constitution.get_supabase_admin_client", lambda: mock_supabase)
    monkeypatch.setattr("app.services.quota.get_supabase_admin_client", lambda: None)

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
