import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.routers.law_history import _draft_store, _source_doc_store, require_admin_user
from app.schemas.user import UserProfile


# Mock admin user dependency override for testing admin endpoints
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
def clean_in_memory_stores():
    _draft_store.clear()
    _source_doc_store.clear()


@pytest.mark.asyncio
async def test_get_law_history_unpublished_returns_amendments():
    """When no entry is published, hasHistory is false but amendments touching the article are listed."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Article 21 was amended by 44th Amendment Act
        response = await client.get("/api/law-history/21")
        assert response.status_code == 200
        data = response.json()

        assert data["articleRef"] == "21"
        assert data["hasHistory"] is False
        assert data["history"] is None
        assert isinstance(data["allAmendments"], list)
        assert len(data["allAmendments"]) > 0

        # Check structure of amendments list
        first_amd = data["allAmendments"][0]
        assert "amendmentNumber" in first_amd
        assert "title" in first_amd
        assert "sectionNumber" in first_amd
        assert "actionType" in first_amd
        assert "hasVerifiedHistory" in first_amd
        assert first_amd["hasVerifiedHistory"] is False


@pytest.mark.asyncio
async def test_draft_and_publish_with_unverified_source_fails():
    """Absolute Content Rule: publishing an entry without a verified source document fails with 400."""
    app.dependency_overrides[require_admin_user] = mock_admin
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register an unverified source document in test store
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
async def test_publish_with_verified_source_succeeds_and_appears_in_public_api():
    """Publishing with a verified source succeeds and populates both flat and timeline shapes for frontend."""
    app.dependency_overrides[require_admin_user] = mock_admin
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register a verified source document in test store
        doc_id = "doc-verified-42"
        _source_doc_store[doc_id] = {
            "id": doc_id,
            "verification_status": "verified",
        }

        # 1. Create Draft
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

        # 2. Publish with verified source - succeeds
        res_publish = await client.post(f"/api/admin/law-history/{entry_id}/publish")
        assert res_publish.status_code == 200
        assert res_publish.json()["published"] is True

        # 3. Public GET /api/law-history/Preamble returns full shape
        res_get = await client.get("/api/law-history/Preamble")
        assert res_get.status_code == 200
        get_data = res_get.json()

        assert get_data["articleRef"] == "PREAMBLE"
        assert get_data["hasHistory"] is True
        history = get_data["history"]
        assert history is not None

        # Flat card fields (Prompt 5)
        assert history["olderLaw"] == "SOVEREIGN DEMOCRATIC REPUBLIC ... unity of the Nation"
        assert history["when"] == "1976 (42nd Amendment)"
        assert history["why"] == "To insert SOCIALIST, SECULAR and integrity of the Nation."
        assert history["who"] == "Parliament of India"
        assert "legislative.gov.in" in history["officialSourceUrl"]

        # Timeline entries array (LawHistoryTimeline component)
        assert len(history["entries"]) == 1
        timeline_entry = history["entries"][0]
        assert timeline_entry["kind"] == "amended"
        assert timeline_entry["oldText"] == "SOVEREIGN DEMOCRATIC REPUBLIC ... unity of the Nation"
        assert timeline_entry["authority"] == "Parliament of India"

        # 42nd Amendment is marked verified in allAmendments
        amd_42 = next((a for a in get_data["allAmendments"] if a["amendmentNumber"] == 42), None)
        if amd_42:
            assert amd_42["hasVerifiedHistory"] is True

    app.dependency_overrides.clear()
