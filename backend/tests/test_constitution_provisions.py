# -*- coding: utf-8 -*-
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.routers.constitution import (
    derive_current_status,
    evaluate_law_history_rules,
    _published_provisions,
    _published_law_history,
    _published_amendments,
)
from app.schemas.constitution import LawHistoryEntry


@pytest.fixture(autouse=True)
def clean_constitution_stores(monkeypatch):
    _published_provisions.clear()
    _published_law_history.clear()
    _published_amendments.clear()
    # Mock supabase client to None to run purely offline and fast
    import app.routers.constitution as const_mod
    monkeypatch.setattr(const_mod, "get_supabase_admin_client", lambda: None)


# =========================================================================
# 1. Unit Tests: derive_current_status
# =========================================================================

def make_entry(id_str: str, kind_str: str, date_str: str) -> LawHistoryEntry:
    return LawHistoryEntry(
        id=id_str,
        kind=kind_str,
        effectiveDate=date_str,
        whatChanged="Change description",
        reason="Reason statement",
        changedBy="Parliament of India",
        authority="Parliament of India",
        sourceLabel="Official Gazette",
        sourceUrl="https://legislative.gov.in",
        verifiedOn="2024-05-01"
    )


def test_derive_current_status_empty():
    assert derive_current_status([]) == "in_force"


def test_derive_current_status_single_kinds():
    assert derive_current_status([make_entry("1", "omitted", "1978-06-20")]) == "repealed"
    assert derive_current_status([make_entry("2", "replaced", "2000-01-01")]) == "replaced"
    assert derive_current_status([make_entry("3", "amended", "1976-01-03")]) == "amended"
    assert derive_current_status([make_entry("4", "inserted", "2002-12-12")]) == "amended"


def test_derive_current_status_proposed_never_changes_status():
    # Only proposed -> in_force
    assert derive_current_status([make_entry("p1", "proposed", "2024-01-01")]) == "in_force"

    # Substituted in 1978, followed by a proposed bill in 2024 -> remains amended
    entries = [
        make_entry("1", "amended", "1978-06-20"),
        make_entry("p2", "proposed", "2024-05-01")
    ]
    assert derive_current_status(entries) == "amended"

    # Omitted in 1978, proposed restoration in 2024 -> remains repealed
    entries_omitted = [
        make_entry("1", "omitted", "1978-06-20"),
        make_entry("p3", "proposed", "2024-05-01")
    ]
    assert derive_current_status(entries_omitted) == "repealed"


def test_derive_current_status_multiple_chronological():
    # Substituted in 1955, then omitted in 1978 -> repealed
    entries = [
        make_entry("1", "amended", "1955-04-27"),
        make_entry("2", "omitted", "1978-06-20")
    ]
    assert derive_current_status(entries) == "repealed"


# =========================================================================
# 2. Unit Tests: Three Law History Return Rules
# =========================================================================

def test_law_history_rule_1_incomplete_footnotes_returns_none():
    _published_provisions["21"] = {
        "article_number": "21",
        "title": "Protection of life and personal liberty",
        "content": "No person shall be deprived of his life...",
        "published": True,
        "footnotes": "1. Subs. by the Constitution (Forty-fourth Amendment) Act, 1978, s. 7."
    }
    res = evaluate_law_history_rules("21")
    assert res is None


def test_law_history_rule_2_published_without_footnotes_returns_in_force():
    _published_provisions["14"] = {
        "article_number": "14",
        "title": "Equality before law",
        "content": "The State shall not deny to any person equality before the law...",
        "published": True,
        "footnotes": "",
        "updated_at": "2024-05-01T00:00:00Z"
    }
    res = evaluate_law_history_rules("14")
    assert res is not None
    assert res.currentStatus == "in_force"
    assert res.lastVerifiedOn == "2024-05-01"
    assert len(res.entries) == 0


def test_law_history_rule_3_all_changes_published_returns_oldest_first():
    _published_provisions["31"] = {
        "article_number": "31",
        "title": "Compulsory acquisition of property",
        "content": "[Omitted]",
        "published": True,
        "footnotes": "1. Subs. in 1955.\n2. Omitted in 1978.",
        "updated_at": "2024-05-01T00:00:00Z"
    }
    _published_law_history["31"] = [
        {
            "id": "e2",
            "kind": "omitted",
            "effective_date": "1978-06-20",
            "what_changed": "Article 31 omitted by 44th Amendment Act",
            "why_changed": "To remove property as a fundamental right",
            "who_changed": "Parliament of India",
            "verified_on": "2024-05-01"
        },
        {
            "id": "e1",
            "kind": "substituted",
            "effective_date": "1955-04-27",
            "what_changed": "Clause (2) substituted by 4th Amendment Act",
            "why_changed": "To clarify adequacy of compensation",
            "who_changed": "Parliament of India",
            "verified_on": "2024-05-01"
        }
    ]

    res = evaluate_law_history_rules("31")
    assert res is not None
    assert res.currentStatus == "repealed"
    assert len(res.entries) == 2
    assert res.entries[0].effectiveDate == "1955-04-27"
    assert res.entries[1].effectiveDate == "1978-06-20"


# =========================================================================
# 3. Integration Tests: Constitution Endpoints
# =========================================================================

@pytest.mark.asyncio
async def test_provisions_endpoints():
    _published_provisions["14"] = {
        "article_number": "14",
        "title": "Equality before law",
        "part_number": "III",
        "part_title": "FUNDAMENTAL RIGHTS",
        "content": "The State shall not deny to any person equality before the law...",
        "published": True,
        "footnotes": ""
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. List provisions
        res_list = await client.get("/api/constitution/provisions")
        assert res_list.status_code == 200
        items = res_list.json()
        assert any(i["articleNo"] == "14" for i in items)

        # 2. Get single provision
        res_get = await client.get("/api/constitution/provisions/14")
        assert res_get.status_code == 200
        detail = res_get.json()
        assert detail["articleNo"] == "14"
        assert detail["heading"] == "Equality before law"
        assert detail["source"]["label"] != ""
        assert detail["lawHistory"] is not None
        assert detail["lawHistory"]["currentStatus"] == "in_force"

        # 3. Invalid article format -> 404
        res_bad = await client.get("/api/constitution/provisions/INVALID_ART_12345")
        assert res_bad.status_code == 404

        # 4. Search provisions
        res_search = await client.get("/api/constitution/search?q=equality")
        assert res_search.status_code == 200
        assert len(res_search.json()) >= 1


@pytest.mark.asyncio
async def test_public_law_history_endpoint_matches_frontend_shape():
    _published_provisions["14"] = {
        "article_number": "14",
        "title": "Equality before law",
        "published": True,
        "footnotes": "",
        "updated_at": "2024-05-01"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/law-history/14")
        assert res.status_code == 200
        data = res.json()

        assert "currentStatus" in data
        assert "lastVerifiedOn" in data
        assert "entries" in data
        assert data["currentStatus"] == "in_force"
        assert isinstance(data["entries"], list)
