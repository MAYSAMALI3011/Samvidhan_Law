"""
Pydantic schemas for Law History API matching the frontend types.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class LawHistoryEntryItem(BaseModel):
    id: str
    kind: str = "amended"  # 'amended', 'inserted', 'omitted', 'replaced', 'proposed'
    effectiveDate: str
    whatChanged: str
    oldText: Optional[str] = None
    newText: Optional[str] = None
    reason: str
    reasonSource: Optional[str] = None
    changedBy: str
    authority: str = "Parliament of India"
    sourceLabel: str = "Official Gazette / legislative.gov.in"
    sourceUrl: str
    verifiedOn: str
    isSample: bool = False


class LawHistoryItem(BaseModel):
    # Prompt 5 flat card fields
    olderLaw: str
    when: str
    why: str
    who: str
    officialSourceUrl: str
    # Timeline compatibility fields
    currentStatus: str = "in_force"
    lastVerifiedOn: str = ""
    entries: List[LawHistoryEntryItem] = Field(default_factory=list)


class AmendmentSummary(BaseModel):
    amendmentNumber: int
    year: Optional[int] = None
    title: str
    sectionNumber: str
    actionType: str
    hasVerifiedHistory: bool = False


class LawHistoryResponse(BaseModel):
    articleRef: str
    hasHistory: bool
    history: Optional[LawHistoryItem] = None
    allAmendments: List[AmendmentSummary] = Field(default_factory=list)


class LawHistoryDraftRequest(BaseModel):
    articleRef: str
    olderLaw: str
    when: str
    why: str
    who: str
    officialSourceUrl: str
    sourceDocumentId: str
    sourcePage: int
    amendmentNumber: Optional[int] = None
