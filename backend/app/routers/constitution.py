# -*- coding: utf-8 -*-
"""
Constitution Provisions and Law History API Router.
Strictly serves verified, published rows only.
Enforces the Three Return Rules for Law History.
"""
import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.constitution import (
    ProvisionSummary,
    ProvisionDetail,
    AmendmentItem,
    LawHistory,
    LawHistoryEntry,
    LawStatus,
    LawChangeKind,
    SourceRef,
)
from app.supabase_client import get_supabase_admin_client

router = APIRouter(tags=["constitution"])

# In-memory published stores for local testing / offline dev
_published_provisions: Dict[str, Dict[str, Any]] = {}
_published_law_history: Dict[str, List[Dict[str, Any]]] = {}
_published_amendments: Dict[int, Dict[str, Any]] = {}


def derive_current_status(entries: List[LawHistoryEntry]) -> LawStatus:
    """
    Derives currentStatus from the newest non-'proposed' entry.
    - 'omitted' -> 'repealed'
    - 'replaced' -> 'replaced'
    - 'amended', 'inserted', 'substituted' -> 'amended'
    - none -> 'in_force'
    'proposed' entries never change currentStatus.
    """
    non_proposed = [e for e in entries if e.kind != "proposed"]
    if not non_proposed:
        return "in_force"

    # Sort newest first by effectiveDate to inspect newest
    sorted_newest = sorted(non_proposed, key=lambda x: x.effectiveDate, reverse=True)
    newest_kind = sorted_newest[0].kind

    if newest_kind == "omitted":
        return "repealed"
    if newest_kind == "replaced":
        return "replaced"
    if newest_kind in ["amended", "inserted", "substituted"]:
        return "amended"

    return "in_force"


def evaluate_law_history_rules(article_no: str, provision: Optional[Dict[str, Any]] = None) -> Optional[LawHistory]:
    """
    Evaluates the Three Return Rules:
    1. If the provision has any change footnote and not all changes have a published entry -> return None.
    2. If the provision is published, parsed without flags, and has no change footnotes -> return in_force with empty entries.
    3. Otherwise return published entries sorted oldest first.
    """
    clean_art = article_no.strip().upper()
    supabase = get_supabase_admin_client()

    # 1. Fetch provision if not passed
    prov_data = provision
    if not prov_data:
        if supabase:
            try:
                res = (
                    supabase.table("constitution_provisions")
                    .select("*")
                    .eq("article_number", clean_art)
                    .eq("published", True)
                    .maybe_single()
                    .execute()
                )
                if res and res.data:
                    prov_data = res.data
            except Exception:
                pass
        if not prov_data and clean_art in _published_provisions:
            prov_data = _published_provisions[clean_art]

    if not prov_data:
        return None

    # Check footnotes on provision
    fn_text = prov_data.get("footnotes", "") or ""
    has_change_fn = bool(re.search(r'\b(Subs\.|Ins\.|Omitted|Added|Rep\.)', fn_text, re.IGNORECASE))
    
    # Expected changes count: count change markers in footnote text
    expected_changes = len(re.findall(r'(?:^|\n)\s*\d+\.\s*(?:Subs\.|Ins\.|Omitted|Added|Rep\.)', fn_text, re.IGNORECASE))
    if not expected_changes and has_change_fn:
        expected_changes = 1

    # 2. Fetch published entries for this article
    published_entries: List[Dict[str, Any]] = []
    if supabase:
        try:
            res = (
                supabase.table("law_history_entries")
                .select("*")
                .eq("article_ref", clean_art)
                .eq("published", True)
                .execute()
            )
            if res and res.data:
                published_entries = res.data
        except Exception:
            pass
    if not published_entries and clean_art in _published_law_history:
        published_entries = _published_law_history[clean_art]

    # Rule 1: Has change footnotes and not all changes have published entries
    if has_change_fn and len(published_entries) < expected_changes:
        return None

    # Rule 2: Published with no change footnotes
    if not has_change_fn and not published_entries:
        verified_date = str(prov_data.get("verified_on") or prov_data.get("updated_at") or "2024-05-01")[:10]
        return LawHistory(
            currentStatus="in_force",
            lastVerifiedOn=verified_date,
            entries=[]
        )

    # Rule 3: Return published entries sorted oldest first (effectiveDate ascending)
    parsed_entries: List[LawHistoryEntry] = []
    for r in published_entries:
        parsed_entries.append(
            LawHistoryEntry(
                id=str(r.get("id")),
                kind=r.get("kind", "amended"),
                effectiveDate=r.get("effective_date") or r.get("when_changed", ""),
                whatChanged=r.get("what_changed") or r.get("why_changed", ""),
                oldText=r.get("older_law_text"),
                newText=r.get("new_text"),
                reason=r.get("why_changed") or r.get("reason", "Constitutional Amendment enacted by Parliament"),
                reasonSource=r.get("reason_source"),
                changedBy=r.get("who_changed") or "Parliament of India",
                authority=r.get("authority") or "Parliament of India",
                sourceLabel=r.get("source_label") or "Official Gazette / legislative.gov.in",
                sourceUrl=r.get("official_source_url") or "https://legislative.gov.in",
                verifiedOn=str(r.get("verified_on") or r.get("created_at") or "")[:10],
                isSample=r.get("is_sample", False)
            )
        )

    # Sort oldest first
    sorted_oldest = sorted(parsed_entries, key=lambda x: x.effectiveDate)
    curr_status = derive_current_status(sorted_oldest)
    last_verified = max((e.verifiedOn for e in sorted_oldest if e.verifiedOn), default=str(prov_data.get("updated_at", ""))[:10])

    return LawHistory(
        currentStatus=curr_status,
        lastVerifiedOn=last_verified,
        entries=sorted_oldest
    )


@router.get("/constitution/provisions", response_model=List[ProvisionSummary])
async def list_provisions():
    """List all published constitution provisions."""
    supabase = get_supabase_admin_client()
    results: List[ProvisionSummary] = []

    if supabase:
        try:
            res = (
                supabase.table("constitution_provisions")
                .select("article_number, clause_number, subclause_number, title, part_number, part_title")
                .eq("published", True)
                .is_("clause_number", "null")
                .is_("subclause_number", "null")
                .order("id")
                .execute()
            )
            if res and res.data:
                for row in res.data:
                    results.append(
                        ProvisionSummary(
                            kind="article" if row["article_number"] != "Preamble" else "preamble",
                            articleNo=row["article_number"],
                            heading=row["title"],
                            partNo=row["part_number"],
                            partTitle=row["part_title"]
                        )
                    )
                return results
        except Exception:
            pass

    for clean_art, p in _published_provisions.items():
        if p.get("published", True):
            results.append(
                ProvisionSummary(
                    kind="article" if clean_art != "PREAMBLE" else "preamble",
                    articleNo=p.get("article_number", clean_art),
                    heading=p.get("title", ""),
                    partNo=p.get("part_number"),
                    partTitle=p.get("part_title")
                )
            )
    return results


@router.get("/constitution/provisions/{article_no}", response_model=ProvisionDetail)
async def get_provision_detail(article_no: str):
    """
    Get published provision detail.
    Validates article_no strictly with ^[0-9]{1,3}[A-Z]{0,3}$ or Preamble.
    Unknown or unverified -> 404.
    """
    clean_art = article_no.strip().upper()
    if clean_art != "PREAMBLE" and not re.match(r'^[0-9]{1,3}[A-Z]{0,3}$', clean_art):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invalid or unknown article format: {article_no}"
        )

    supabase = get_supabase_admin_client()
    prov = None
    if supabase:
        try:
            res = (
                supabase.table("constitution_provisions")
                .select("*")
                .eq("article_number", clean_art)
                .eq("published", True)
                .is_("clause_number", "null")
                .is_("subclause_number", "null")
                .maybe_single()
                .execute()
            )
            if res and res.data:
                prov = res.data
        except Exception:
            pass

    if not prov:
        prov = _published_provisions.get(clean_art)

    if not prov or not prov.get("published", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provision Article {article_no} not found or not published."
        )

    # Evaluate Law History under Three Rules
    history = evaluate_law_history_rules(clean_art, prov)

    return ProvisionDetail(
        articleNo=prov.get("article_number", clean_art),
        heading=prov.get("title", ""),
        partNo=prov.get("part_number"),
        partTitle=prov.get("part_title"),
        body=prov.get("content", ""),
        asOnDate=str(prov.get("as_on_date") or prov.get("updated_at") or "2024-05-01")[:10],
        source=SourceRef(
            label="Constitution of India (English pocket edition)",
            url="https://legislative.gov.in"
        ),
        lawHistory=history
    )


@router.get("/constitution/search", response_model=List[ProvisionSummary])
async def search_provisions(q: str = Query(..., min_length=2, max_length=100)):
    """Full-text search over published provisions (2 to 100 characters, max 10 results)."""
    clean_q = q.strip().lower()
    supabase = get_supabase_admin_client()
    results: List[ProvisionSummary] = []

    if supabase:
        try:
            res = (
                supabase.table("constitution_provisions")
                .select("article_number, title, part_number, part_title, content")
                .eq("published", True)
                .ilike("content", f"%{clean_q}%")
                .limit(10)
                .execute()
            )
            if res and res.data:
                for row in res.data:
                    results.append(
                        ProvisionSummary(
                            kind="article" if row["article_number"] != "Preamble" else "preamble",
                            articleNo=row["article_number"],
                            heading=row["title"],
                            partNo=row["part_number"],
                            partTitle=row["part_title"]
                        )
                    )
                return results
        except Exception:
            pass

    for clean_art, p in _published_provisions.items():
        if p.get("published", True):
            if clean_q in p.get("content", "").lower() or clean_q in p.get("title", "").lower():
                results.append(
                    ProvisionSummary(
                        kind="article" if clean_art != "PREAMBLE" else "preamble",
                        articleNo=p.get("article_number", clean_art),
                        heading=p.get("title", ""),
                        partNo=p.get("part_number"),
                        partTitle=p.get("part_title")
                    )
                )
                if len(results) >= 10:
                    break

    return results


@router.get("/constitution/amendments", response_model=List[AmendmentItem])
async def list_amendments():
    """List verified published amendment acts."""
    supabase = get_supabase_admin_client()
    results: List[AmendmentItem] = []

    if supabase:
        try:
            res = (
                supabase.table("amendment_acts")
                .select("number, title, year, assent_date, has_reasons")
                .eq("published", True)
                .order("number")
                .execute()
            )
            if res and res.data:
                for row in res.data:
                    results.append(
                        AmendmentItem(
                            number=row["number"],
                            title=row["title"],
                            year=row.get("year"),
                            assentDate=row.get("assent_date"),
                            source=SourceRef(
                                label="Gazette of India",
                                url="https://legislative.gov.in"
                            ),
                            hasReasons=row.get("has_reasons", False)
                        )
                    )
                return results
        except Exception:
            pass

    for num, a in sorted(_published_amendments.items()):
        if a.get("published", True):
            results.append(
                AmendmentItem(
                    number=num,
                    title=a.get("title", f"Amendment Act {num}"),
                    year=a.get("year"),
                    assentDate=a.get("assent_date"),
                    source=SourceRef(
                        label="Gazette of India",
                        url="https://legislative.gov.in"
                    ),
                    hasReasons=a.get("has_reasons", False)
                )
            )
    return results


@router.get("/constitution/amendments/{number}", response_model=AmendmentItem)
async def get_amendment(number: int):
    """Get single verified amendment act."""
    supabase = get_supabase_admin_client()
    row = None

    if supabase:
        try:
            res = (
                supabase.table("amendment_acts")
                .select("number, title, year, assent_date, has_reasons")
                .eq("number", number)
                .eq("published", True)
                .maybe_single()
                .execute()
            )
            if res and res.data:
                row = res.data
        except Exception:
            pass

    if not row:
        row = _published_amendments.get(number)

    if not row or not row.get("published", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Amendment Act {number} not found or not published."
        )

    return AmendmentItem(
        number=row["number"],
        title=row["title"],
        year=row.get("year"),
        assentDate=row.get("assent_date"),
        source=SourceRef(
            label="Gazette of India",
            url="https://legislative.gov.in"
        ),
        hasReasons=row.get("has_reasons", False)
    )


@router.get("/law-history/{article_no}", response_model=LawHistory)
async def get_public_law_history(article_no: str):
    """
    Public Law History Endpoint:
    Returns the exact frontend LawHistory object (currentStatus, lastVerifiedOn, entries oldest first).
    Enforces the Three Return Rules:
    1. Returns 404 if provision has change footnotes but not all changes are published.
    2. Returns in_force with empty entries if published without change footnotes.
    3. Returns published entries sorted oldest first.
    Never returns unverified or draft data.
    """
    clean_art = article_no.strip().upper()
    history = evaluate_law_history_rules(clean_art)

    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Law history is pending official verification for Article {article_no}."
        )

    return history
