# -*- coding: utf-8 -*-
"""
Tests for Constitution Provisions, Search, Amendments, and Law History Rule evaluation.
All test fixtures are marked isSample: True and live strictly in this test file.
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.schemas.constitution import LawHistory, LawHistoryEntry
from app.routers.constitution import (
    derive_current_status,
    evaluate_law_history_rules,
)

# Test-only in-memory storage for mock Supabase client
_test_db_provisions = {}
_test_db_law_history = {}
_test_db_amendments = {}


class MockTable:
    def __init__(self, table_name: str):
        self.table_name = table_name
        self._filters = {}
        self._order_by = None
        self._text_search_q = None

    def select(self, *args, **kwargs):
        return self

    def eq(self, col: str, val: any):
        self._filters[col] = val
        return self

    def text_search(self, col: str, val: str):
        self._text_search_q = val.lower()
        return self

    def order(self, col: str, **kwargs):
        self._order_by = col
        return self

    def limit(self, count: int):
        return self

    def maybe_single(self):
        class SingleRes:
            def __init__(self, data):
                self.data = data
        data_list = self._execute_filter()
        return type("MockExecute", (), {"execute": lambda s: SingleRes(data_list[0] if data_list else None)})()

    def execute(self):
        class MultiRes:
            def __init__(self, data):
                self.data = data
        return MultiRes(self._execute_filter())

    def _execute_filter(self):
        if self.table_name == "constitution_provisions":
            data = list(_test_db_provisions.values())
        elif self.table_name == "law_history_entries":
            data = [e for sublist in _test_db_law_history.values() for e in sublist]
        elif self.table_name == "amendment_acts":
            data = list(_test_db_amendments.values())
        else:
            data = []

        res = []
        for row in data:
            match = True
            for k, v in self._filters.items():
                if row.get(k) != v:
                    match = False
                    break
            if match and self._text_search_q:
                text_corpus = (row.get("heading", "") + " " + row.get("body_raw", "")).lower()
                if self._text_search_q not in text_corpus:
                    match = False
            if match:
                res.append(row)
        return res


class MockSupabaseClient:
    def table(self, name: str):
        return MockTable(name)


@pytest.fixture(autouse=True)
def setup_mock_supabase(monkeypatch):
    _test_db_provisions.clear()
    _test_db_law_history.clear()
    _test_db_amendments.clear()
    import app.routers.constitution as const_mod
    monkeypatch.setattr(const_mod, "get_supabase_admin_client", lambda: MockSupabaseClient())


def make_sample_entry(id_str: str, kind_str: str, date_str: str) -> LawHistoryEntry:
    return LawHistoryEntry(
        id=id_str,
        kind=kind_str,
        effectiveDate=date_str,
        whatChanged="Sample test change",
        reason="Sample test reason",
        changedBy="Parliament of India",
        authority="Parliament of India",
        sourceLabel="Official Gazette",
        sourceUrl="https://legislative.gov.in",
        verifiedOn="2024-05-01",
        isSample=True
    )


# =========================================================================
# 1. Unit Tests: derive_current_status
# =========================================================================

def test_derive_current_status_empty():
    assert derive_current_status([]) == "in_force"


def test_derive_current_status_single_kinds():
    assert derive_current_status([make_sample_entry("1", "omitted", "1978-06-20")]) == "repealed"
    assert derive_current_status([make_sample_entry("2", "replaced", "2000-01-01")]) == "replaced"
    assert derive_current_status([make_sample_entry("3", "amended", "1976-01-03")]) == "amended"
    assert derive_current_status([make_sample_entry("4", "inserted", "2002-12-12")]) == "amended"


def test_derive_current_status_proposed_never_changes_status():
    assert derive_current_status([make_sample_entry("p1", "proposed", "2024-01-01")]) == "in_force"

    entries = [
        make_sample_entry("1", "amended", "1978-06-20"),
        make_sample_entry("p2", "proposed", "2024-05-01")
    ]
    assert derive_current_status(entries) == "amended"

    entries_omitted = [
        make_sample_entry("1", "omitted", "1978-06-20"),
        make_sample_entry("p3", "proposed", "2024-05-01")
    ]
    assert derive_current_status(entries_omitted) == "repealed"


def test_derive_current_status_multiple_chronological():
    entries = [
        make_sample_entry("1", "amended", "1955-04-27"),
        make_sample_entry("2", "omitted", "1978-06-20")
    ]
    assert derive_current_status(entries) == "repealed"


# =========================================================================
# 2. Unit Tests: Three Law History Return Rules
# =========================================================================

def test_law_history_rule_1_incomplete_footnotes_returns_none():
    _test_db_provisions["21"] = {
        "article_no": "21",
        "heading": "Protection of life and personal liberty",
        "body_raw": "No person shall be deprived of his life...",
        "status": "published",
        "footnotes": "1. Subs. by the Constitution (Forty-fourth Amendment) Act, 1978, s. 7.",
        "verified_on": "2024-05-01"
    }
    res = evaluate_law_history_rules("21")
    assert res is None


def test_law_history_rule_2_published_without_footnotes_returns_in_force():
    _test_db_provisions["14"] = {
        "article_no": "14",
        "heading": "Equality before law",
        "body_raw": "The State shall not deny to any person equality before the law...",
        "status": "published",
        "footnotes": "",
        "verified_on": "2024-05-01"
    }
    res = evaluate_law_history_rules("14")
    assert res is not None
    assert res.currentStatus == "in_force"
    assert res.lastVerifiedOn == "2024-05-01"
    assert len(res.entries) == 0


def test_law_history_rule_3_all_changes_published_returns_oldest_first():
    _test_db_provisions["31"] = {
        "article_no": "31",
        "heading": "Compulsory acquisition of property",
        "body_raw": "[Omitted]",
        "status": "published",
        "footnotes": "1. Subs. in 1955.\n2. Omitted in 1978.",
        "verified_on": "2024-05-01"
    }
    _test_db_law_history["31"] = [
        {
            "id": "e2",
            "article_ref": "31",
            "kind": "omitted",
            "effective_date": "1978-06-20",
            "what_changed": "Article 31 omitted by 44th Amendment Act",
            "reason": "To remove property as a fundamental right",
            "changed_by": "Parliament of India",
            "authority": "Parliament of India",
            "source_label": "Official Gazette",
            "source_url": "https://legislative.gov.in",
            "verified_on": "2024-05-01",
            "status": "published"
        },
        {
            "id": "e1",
            "article_ref": "31",
            "kind": "amended",
            "effective_date": "1955-04-27",
            "what_changed": "Clause (2) substituted by 4th Amendment Act",
            "reason": "To clarify adequacy of compensation",
            "changed_by": "Parliament of India",
            "authority": "Parliament of India",
            "source_label": "Official Gazette",
            "source_url": "https://legislative.gov.in",
            "verified_on": "2024-05-01",
            "status": "published"
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
    _test_db_provisions["14"] = {
        "article_no": "14",
        "heading": "Equality before law",
        "part_no": "III",
        "part_title": "FUNDAMENTAL RIGHTS",
        "body_raw": "The State shall not deny to any person equality before the law...",
        "status": "published",
        "footnotes": "",
        "as_on_date": "2024-05-01",
        "verified_on": "2024-05-01"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_list = await client.get("/api/constitution/provisions")
        assert res_list.status_code == 200
        items = res_list.json()
        assert any(i["articleNo"] == "14" for i in items)

        res_get = await client.get("/api/constitution/provisions/14")
        assert res_get.status_code == 200
        detail = res_get.json()
        assert detail["articleNo"] == "14"
        assert detail["lawHistory"]["currentStatus"] == "in_force"
        assert len(detail["lawHistory"]["entries"]) == 0

        res_search = await client.get("/api/constitution/search?q=equality")
        assert res_search.status_code == 200
        search_items = res_search.json()
        assert len(search_items) >= 1


@pytest.mark.asyncio
async def test_public_law_history_endpoint_matches_frontend_shape():
    _test_db_provisions["14"] = {
        "article_no": "14",
        "heading": "Equality before law",
        "body_raw": "Content",
        "status": "published",
        "footnotes": "",
        "verified_on": "2024-05-01"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/law-history/14")
        assert res.status_code == 200
        data = res.json()
        assert data["currentStatus"] == "in_force"
        assert data["lastVerifiedOn"] == "2024-05-01"
        assert data["entries"] == []
