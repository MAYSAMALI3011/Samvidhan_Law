# -*- coding: utf-8 -*-
"""
Constitution Provisions and Law History API Router.
Strictly serves verified, published rows from the database only.
Never returns draft, unverified, or hard-coded fixture data to the public.
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


def normalize_iso_date(date_str: Optional[str]) -> str:
    if not date_str:
        return ""
    date_str = date_str.strip()
    if re.match(r'^\d{4}(-\d{2}(-\d{2})?)?$', date_str):
        return date_str
    m = re.match(r'^(\d{1,2})-(\d{1,2})-(\d{4})$', date_str)
    if m:
        day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}"
    return ""


def derive_current_status(entries: List[LawHistoryEntry]) -> LawStatus:
    """
    Derives currentStatus from the newest non-'proposed' entry.
    - 'omitted' -> 'repealed'
    - 'replaced' -> 'replaced'
    - 'amended', 'inserted' -> 'amended'
    - none -> 'in_force'
    'proposed' entries never change currentStatus.
    """
    non_proposed = [e for e in entries if e.kind != "proposed"]
    if not non_proposed:
        return "in_force"

    sorted_newest = sorted(non_proposed, key=lambda x: x.effectiveDate, reverse=True)
    newest_kind = sorted_newest[0].kind

    if newest_kind == "omitted":
        return "repealed"
    if newest_kind == "replaced":
        return "replaced"
    if newest_kind in ["amended", "inserted"]:
        return "amended"

    return "in_force"


def evaluate_law_history_rules(article_no: str, provision: Optional[Dict[str, Any]] = None) -> Optional[LawHistory]:
    """
    Evaluates the Three Return Rules against the database:
    1. If the provision has any change footnote and not all changes have a published entry -> return None.
    2. If the provision is published, parsed without flags, and has no change footnotes -> return in_force with empty entries.
    3. Otherwise return published entries sorted oldest first.
    Never returns draft, unverified, or fixture data to the public.
    """
    clean_art = article_no.strip().upper()
    supabase = get_supabase_admin_client()
    if not supabase:
        return None

    # 1. Fetch provision from database if not passed
    prov_data = provision
    if not prov_data:
        try:
            res = (
                supabase.table("constitution_provisions")
                .select("*")
                .eq("article_no", clean_art)
                .eq("status", "published")
                .maybe_single()
                .execute()
            )
            if res and res.data:
                prov_data = res.data
        except Exception:
            return None

    if not prov_data:
        return None

    # Check footnotes on provision
    fn_text = prov_data.get("footnotes", "") or ""
    if isinstance(fn_text, list):
        fn_text = " ".join([f.get("text", "") for f in fn_text if isinstance(f, dict)])
    has_change_fn = bool(re.search(r'\b(Subs\.|Ins\.|Omitted|Added|Rep\.)', str(fn_text), re.IGNORECASE))
    
    expected_changes = len(re.findall(r'(?:^|\n)\s*\d+\.\s*(?:Subs\.|Ins\.|Omitted|Added|Rep\.)', str(fn_text), re.IGNORECASE))
    if not expected_changes and has_change_fn:
        expected_changes = 1

    # 2. Fetch published, verified entries for this article from database
    published_entries: List[Dict[str, Any]] = []
    try:
        res = (
            supabase.table("law_history_entries")
            .select("*")
            .eq("article_ref", clean_art)
            .eq("status", "published")
            .execute()
        )
        if res and res.data:
            published_entries = res.data
    except Exception:
        return None

    # Rule 1: Has change footnotes and not all changes have published entries
    if has_change_fn and len(published_entries) < expected_changes:
        return None

    # Rule 2: Published with no change footnotes
    if not has_change_fn and not published_entries:
        verified_date = str(prov_data.get("verified_on") or "")[:10]
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', verified_date):
            return None  # Unverified provisions do not expose public lawHistory
        return LawHistory(
            currentStatus="in_force",
            lastVerifiedOn=verified_date,
            entries=[]
        )

    # Rule 3: Return published entries sorted oldest first (effectiveDate ascending)
    parsed_entries: List[LawHistoryEntry] = []
    for r in published_entries:
        raw_kind = r.get("kind", "amended")
        clean_kind = raw_kind if raw_kind in ["original", "amended", "inserted", "omitted", "replaced", "proposed"] else "amended"

        eff_date = normalize_iso_date(r.get("effective_date"))
        ver_date = str(r.get("verified_on") or "")[:10]
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', ver_date):
            return None  # All published entries must have verifiedOn set

        parsed_entries.append(
            LawHistoryEntry(
                id=str(r.get("id")),
                kind=clean_kind,
                effectiveDate=eff_date,
                whatChanged=r.get("what_changed") or "",
                oldText=r.get("old_text"),
                newText=r.get("new_text"),
                reason=r.get("reason") or "",
                reasonSource=r.get("reason_source"),
                changedBy=r.get("changed_by") or "",
                authority=r.get("authority") or "",
                sourceLabel=r.get("source_label") or "",
                sourceUrl=r.get("source_url") or "",
                verifiedOn=ver_date,
                isSample=False
            )
        )

    sorted_oldest = sorted(parsed_entries, key=lambda x: x.effectiveDate)
    curr_status = derive_current_status(sorted_oldest)
    last_verified = max((e.verifiedOn for e in sorted_oldest if e.verifiedOn), default="")

    if not last_verified:
        return None

    return LawHistory(
        currentStatus=curr_status,
        lastVerifiedOn=last_verified,
        entries=sorted_oldest
    )


@router.get("/constitution/provisions", response_model=List[ProvisionSummary])
async def list_provisions():
    """List all published constitution provisions from database."""
    supabase = get_supabase_admin_client()
    results: List[ProvisionSummary] = []
    if not supabase:
        return results

    try:
        res = (
            supabase.table("constitution_provisions")
            .select("kind, article_no, heading, part_no, part_title")
            .eq("status", "published")
            .order("page_start")
            .execute()
        )
        if res and res.data:
            for row in res.data:
                results.append(
                    ProvisionSummary(
                        kind=row.get("kind", "article"),
                        articleNo=row.get("article_no", ""),
                        heading=row.get("heading", ""),
                        partNo=row.get("part_no"),
                        partTitle=row.get("part_title")
                    )
                )
    except Exception:
        pass

    return results


@router.get("/constitution/provisions/{article_no}", response_model=ProvisionDetail)
async def get_provision(article_no: str):
    """Get published provision details from database."""
    clean_art = article_no.strip().upper()
    supabase = get_supabase_admin_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provision not found: Article {article_no}"
        )

    prov_row = None
    try:
        res = (
            supabase.table("constitution_provisions")
            .select("*")
            .eq("article_no", clean_art)
            .eq("status", "published")
            .maybe_single()
            .execute()
        )
        if res and res.data:
            prov_row = res.data
    except Exception:
        pass

    if not prov_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provision not found: Article {article_no}"
        )

    # Evaluate law history rules for this provision
    law_history = evaluate_law_history_rules(clean_art, provision=prov_row)

    return ProvisionDetail(
        articleNo=prov_row.get("article_no", ""),
        heading=prov_row.get("heading", ""),
        partNo=prov_row.get("part_no"),
        partTitle=prov_row.get("part_title"),
        body=prov_row.get("body_raw", ""),
        asOnDate=str(prov_row.get("as_on_date") or "")[:10],
        source=SourceRef(
            label="Constitution of India",
            url=""
        ),
        lawHistory=law_history
    )


@router.get("/constitution/search", response_model=List[ProvisionSummary])
async def search_provisions(q: str = Query(..., min_length=2)):
    """Full-text search across published constitution provisions."""
    supabase = get_supabase_admin_client()
    results: List[ProvisionSummary] = []
    if not supabase:
        return results

    try:
        res = (
            supabase.table("constitution_provisions")
            .select("kind, article_no, heading, part_no, part_title")
            .eq("status", "published")
            .text_search("search_tsv", q)
            .limit(20)
            .execute()
        )
        if res and res.data:
            for row in res.data:
                results.append(
                    ProvisionSummary(
                        kind=row.get("kind", "article"),
                        articleNo=row.get("article_no", ""),
                        heading=row.get("heading", ""),
                        partNo=row.get("part_no"),
                        partTitle=row.get("part_title")
                    )
                )
    except Exception:
        pass

    return results


@router.get("/constitution/amendments", response_model=List[AmendmentItem])
async def list_amendments():
    """List published amendment acts."""
    supabase = get_supabase_admin_client()
    results: List[AmendmentItem] = []
    if not supabase:
        return results

    try:
        res = (
            supabase.table("amendment_acts")
            .select("number, title, year, assent_date")
            .eq("status", "published")
            .order("number")
            .execute()
        )
        if res and res.data:
            for row in res.data:
                results.append(
                    AmendmentItem(
                        number=row.get("number"),
                        title=row.get("title", ""),
                        year=row.get("year"),
                        assentDate=str(row.get("assent_date") or "")[:10] if row.get("assent_date") else None,
                        source=SourceRef(
                            label=row.get("title", ""),
                            url=""
                        ),
                        hasReasons=False
                    )
                )
    except Exception:
        pass

    return results


@router.get("/constitution/amendments/{number}", response_model=AmendmentItem)
async def get_amendment(number: int):
    """Get published amendment details."""
    supabase = get_supabase_admin_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Amendment not found: {number}"
        )

    row = None
    try:
        res = (
            supabase.table("amendment_acts")
            .select("number, title, year, assent_date")
            .eq("number", number)
            .eq("status", "published")
            .maybe_single()
            .execute()
        )
        if res and res.data:
            row = res.data
    except Exception:
        pass

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Amendment not found: {number}"
        )

    return AmendmentItem(
        number=row.get("number"),
        title=row.get("title", ""),
        year=row.get("year"),
        assentDate=str(row.get("assent_date") or "")[:10] if row.get("assent_date") else None,
        source=SourceRef(
            label=row.get("title", ""),
            url=""
        ),
        hasReasons=False
    )


@router.get("/law-history/{article_no}", response_model=LawHistory)
async def get_public_law_history(article_no: str):
    """
    Public Law History Endpoint:
    Returns the exact frontend LawHistory object (currentStatus, lastVerifiedOn, entries oldest first).
    Enforces the Three Return Rules:
    1. Returns 404 if provision has change footnotes but not all changes are published and verified.
    2. Returns in_force with empty entries if published without change footnotes.
    3. Returns published entries sorted oldest first.
    Never returns unverified or draft data to the public.
    """
    clean_art = article_no.strip().upper()
    history = evaluate_law_history_rules(clean_art)

    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Law history is not available or pending official verification for Article {article_no}."
        )

    return history
