# -*- coding: utf-8 -*-
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.routers.law_history import _draft_store, _source_doc_store, require_admin_user
from app.schemas.user import UserProfile


def mock_admin():
    return UserProfile(
        id="usr-admin-1",
        name="Admin Test",
        email="admin@example.com",
        role="admin",
        tier="owner",
        aiUsageToday=0,
    )


@pytest.fixture(autouse=True)
def clean_in_memory_stores(monkeypatch):
    _draft_store.clear()
    _source_doc_store.clear()
    # Mock supabase to None for fast offline unit tests
    import app.routers.law_history as lh_mod
    monkeypatch.setattr(lh_mod, "get_supabase_admin_client", lambda: None)


@pytest.mark.asyncio
async def test_get_law_history_unverified_returns_404():
    """Public endpoint must NEVER return unverified or draft data. Returns 404 under Rule 1."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Article 21 is not yet published in database -> returns 404
        response = await client.get("/api/law-history/21")
        assert response.status_code == 404
        assert "pending official verification" in response.json()["message"]


@pytest.mark.asyncio
async def test_draft_and_publish_with_unverified_source_fails():
    """Absolute Content Rule: publishing an entry without a verified source document fails with 400."""
    app.dependency_overrides[require_admin_user] = mock_admin
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        doc_id = "doc-unverified-1"
        _source_doc_store[doc_id] = {
            "id": doc_id,
            "verification_status": "unverified",
        }

        # 1. Create Draft
        draft_payload = {
            "articleRef": "21A",
            "olderLaw": "No direct constitutional right to free and compulsory education prior to 2002.",
            "when": "2002 (86th Amendment)",
            "why": "To make right to education a Fundamental Right for children aged 6 to 14.",
            "who": "Parliament of India",
            "officialSourceUrl": "https://legislative.gov.in/actsofparliamentfromtheyear/constitution-eighty-sixth-amendment-act-2002",
            "sourceDocumentId": doc_id,
            "sourcePage": 1,
            "amendmentNumber": 86,
        }

        res_draft = await client.post("/api/admin/law-history/draft", json=draft_payload)
        assert res_draft.status_code == 201
        draft_data = res_draft.json()
        entry_id = draft_data["id"]
        assert draft_data["published"] is False

        # 2. Attempt publish - MUST fail with 400 because source is unverified
        res_publish = await client.post(f"/api/admin/law-history/{entry_id}/publish")
        assert res_publish.status_code == 400
        assert "Cannot publish law history whose source document has not been verified" in res_publish.json()["message"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_publish_with_verified_source_succeeds():
    """Publishing with a verified source succeeds."""
    app.dependency_overrides[require_admin_user] = mock_admin
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        doc_id = "doc-verified-42"
        _source_doc_store[doc_id] = {
            "id": doc_id,
            "verification_status": "verified",
        }

        draft_payload = {
            "articleRef": "Preamble",
            "olderLaw": "SOVEREIGN DEMOCRATIC REPUBLIC ... unity of the Nation",
            "when": "1976 (42nd Amendment)",
            "why": "To insert SOCIALIST, SECULAR and integrity of the Nation.",
            "who": "Parliament of India",
            "officialSourceUrl": "https://legislative.gov.in/actsofparliamentfromtheyear/constitution-forty-second-amendment-act-1976",
            "sourceDocumentId": doc_id,
            "sourcePage": 1,
            "amendmentNumber": 42,
        }

        res_draft = await client.post("/api/admin/law-history/draft", json=draft_payload)
        assert res_draft.status_code == 201
        entry_id = res_draft.json()["id"]

        # Publish with verified source succeeds
        res_publish = await client.post(f"/api/admin/law-history/{entry_id}/publish")
        assert res_publish.status_code == 200
        assert res_publish.json()["published"] is True

    app.dependency_overrides.clear()
