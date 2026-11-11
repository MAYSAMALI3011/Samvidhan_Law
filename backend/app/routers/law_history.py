"""
Law History API router providing verified legal history and amendment summaries.
Matches the frontend LawHistory type and enforces the Absolute Content Rule.
"""
import json
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.deps import get_current_user
from app.schemas.user import UserProfile
from app.schemas.law_history import (
    AmendmentSummary,
    LawHistoryDraftRequest,
    LawHistoryEntryItem,
    LawHistoryItem,
    LawHistoryResponse,
)
from app.supabase_client import get_supabase_admin_client

router = APIRouter(tags=["law-history"])

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# In-memory storage fallback for local development & offline testing
_draft_store: Dict[str, Dict[str, Any]] = {}
_source_doc_store: Dict[str, Dict[str, Any]] = {}


def _get_amendments_for_article(article_ref: str) -> List[AmendmentSummary]:
    """Retrieve all Amendment Acts and sections touching this article."""
    results: List[AmendmentSummary] = []
    clean_ref = article_ref.strip().upper()

    supabase = get_supabase_admin_client()
    if supabase:
        try:
            # Query amendment_sections containing clean_ref in article_refs array
            res = (
                supabase.table("amendment_sections")
                .select("amendment_number, section_number, action_type, amendment_acts(year, title)")
                .contains("article_refs", [clean_ref])
                .execute()
            )
            if res.data:
                for row in res.data:
                    act_info = row.get("amendment_acts") or {}
                    results.append(
                        AmendmentSummary(
                            amendmentNumber=row["amendment_number"],
                            year=act_info.get("year"),
                            title=act_info.get("title") or f"Amendment Act {row['amendment_number']}",
                            sectionNumber=row["section_number"],
                            actionType=row["action_type"],
                            hasVerifiedHistory=False,
                        )
                    )
                return sorted(results, key=lambda x: x.amendmentNumber)
        except Exception:
            pass

    # Fallback to backend/reports/parsed_amendments.json
    candidates = [
        REPO_ROOT / "reports" / "parsed_amendments.json",
        REPO_ROOT / "backend" / "reports" / "parsed_amendments.json",
        Path(__file__).resolve().parent.parent.parent / "reports" / "parsed_amendments.json",
        Path(__file__).resolve().parent.parent.parent.parent / "backend" / "reports" / "parsed_amendments.json",
    ]
    for json_path in candidates:
        if json_path.exists():
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for act in data.get("acts", []):
                    for sec in act.get("sections", []):
                        refs = [r.strip().upper() for r in sec.get("article_refs", [])]
                        if clean_ref in refs:
                            results.append(
                                AmendmentSummary(
                                    amendmentNumber=act["number"],
                                    year=act.get("year"),
                                    title=act.get("title", f"Amendment Act {act['number']}"),
                                    sectionNumber=sec["section_number"],
                                    actionType=sec["action_type"],
                                    hasVerifiedHistory=False,
                                )
                            )
                return sorted(results, key=lambda x: x.amendmentNumber)
            except Exception:
                pass

    return results


async def require_admin_user(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Ensure user has admin or owner privileges."""
    if user.role not in ["admin", "owner"] and user.tier not in ["owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for managing law history.",
        )
    return user


@router.get("/law-history/{article_ref}", response_model=LawHistoryResponse)
async def get_law_history(article_ref: str):
    """
    Public endpoint: Get published law history and all amendment acts touching an article.
    If no verified entry has been published yet, returns hasHistory: false with allAmendments.
    """
    clean_ref = article_ref.strip().upper()
    all_amendments = _get_amendments_for_article(clean_ref)

    # Check database for published history entry
    supabase = get_supabase_admin_client()
    published_entry = None

    if supabase:
        try:
            res = (
                supabase.table("law_history_entries")
                .select("*")
                .eq("article_ref", clean_ref)
                .eq("published", True)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if res.data:
                published_entry = res.data[0]
        except Exception:
            pass

    # Check in-memory store if DB didn't find one
    if not published_entry:
        for entry in _draft_store.values():
            if entry.get("article_ref") == clean_ref and entry.get("published") is True:
                published_entry = entry
                break

    if not published_entry:
        return LawHistoryResponse(
            articleRef=clean_ref,
            hasHistory=False,
            history=None,
            allAmendments=all_amendments,
        )

    # Build timeline entry
    entry_item = LawHistoryEntryItem(
        id=str(published_entry.get("id")),
        kind="amended",
        effectiveDate=published_entry.get("when_changed", ""),
        whatChanged=published_entry.get("why_changed", ""),
        oldText=published_entry.get("older_law_text"),
        reason=published_entry.get("why_changed", ""),
        changedBy=published_entry.get("who_changed", "Parliament of India"),
        authority="Parliament of India",
        sourceLabel="Official Gazette of India",
        sourceUrl=published_entry.get("official_source_url", "https://legislative.gov.in"),
        verifiedOn=str(published_entry.get("created_at", ""))[:10],
    )

    history_obj = LawHistoryItem(
        olderLaw=published_entry.get("older_law_text", ""),
        when=published_entry.get("when_changed", ""),
        why=published_entry.get("why_changed", ""),
        who=published_entry.get("who_changed", "Parliament of India"),
        officialSourceUrl=published_entry.get("official_source_url", "https://legislative.gov.in"),
        currentStatus="in_force",
        lastVerifiedOn=str(published_entry.get("created_at", ""))[:10],
        entries=[entry_item],
    )

    # Mark hasVerifiedHistory on corresponding amendment
    amd_num = published_entry.get("amendment_number")
    if amd_num:
        for a in all_amendments:
            if a.amendmentNumber == amd_num:
                a.hasVerifiedHistory = True

    return LawHistoryResponse(
        articleRef=clean_ref,
        hasHistory=True,
        history=history_obj,
        allAmendments=all_amendments,
    )


@router.post("/admin/law-history/draft", status_code=status.HTTP_201_CREATED)
async def create_law_history_draft(
    payload: LawHistoryDraftRequest,
    admin_user: UserProfile = Depends(require_admin_user),
):
    """
    Admin endpoint: Draft a law history entry.
    Entries are always created with published = false until verified.
    """
    clean_ref = payload.articleRef.strip().upper()
    entry_id = str(uuid.uuid4())

    entry_data = {
        "id": entry_id,
        "article_ref": clean_ref,
        "older_law_text": payload.olderLaw,
        "when_changed": payload.when,
        "why_changed": payload.why,
        "who_changed": payload.who,
        "official_source_url": payload.officialSourceUrl,
        "source_document_id": payload.sourceDocumentId,
        "source_page": payload.sourcePage,
        "amendment_number": payload.amendmentNumber,
        "published": False,
    }

    supabase = get_supabase_admin_client()
    if supabase:
        try:
            res = supabase.table("law_history_entries").insert(entry_data).execute()
            if res.data:
                return res.data[0]
        except Exception:
            pass

    # In-memory save fallback
    _draft_store[entry_id] = entry_data
    return entry_data


@router.post("/admin/law-history/{entry_id}/publish")
async def publish_law_history_entry(
    entry_id: str,
    admin_user: UserProfile = Depends(require_admin_user),
):
    """
    Admin endpoint: Publish a law history entry.
    Enforces Absolute Content Rule: Rejects if source document is not verified.
    """
    supabase = get_supabase_admin_client()
    entry = None

    if supabase:
        try:
            res = supabase.table("law_history_entries").select("*").eq("id", entry_id).maybe_single().execute()
            if res and res.data:
                entry = res.data
        except Exception:
            pass

    if not entry:
        entry = _draft_store.get(entry_id)

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Law history entry not found: {entry_id}",
        )

    # Verification status check
    source_doc_id = entry.get("source_document_id")
    is_verified = False

    if supabase and source_doc_id:
        try:
            doc_res = (
                supabase.table("source_documents")
                .select("verification_status")
                .eq("id", source_doc_id)
                .maybe_single()
                .execute()
            )
            if doc_res and doc_res.data:
                is_verified = doc_res.data.get("verification_status") == "verified"
        except Exception:
            pass
    if not is_verified and source_doc_id in _source_doc_store:
        is_verified = _source_doc_store[source_doc_id].get("verification_status") == "verified"

    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish law history whose source document has not been verified against legislative.gov.in.",
        )

    # Mark published
    if supabase:
        try:
            up_res = supabase.table("law_history_entries").update({"published": True}).eq("id", entry_id).execute()
            if up_res and up_res.data:
                return {"success": True, "published": True, "entry": up_res.data[0]}
        except Exception:
            pass

    entry["published"] = True
    _draft_store[entry_id] = entry
    return {"success": True, "published": True, "entry": entry}
