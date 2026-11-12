# -*- coding: utf-8 -*-
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.constitution import LawHistory, LawHistoryEntry, LawStatus, LawChangeKind

# Type aliases for backwards compatibility with early drafts
LawHistoryEntryItem = LawHistoryEntry
LawHistoryItem = LawHistory

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
    history: Optional[LawHistory] = None
    allAmendments: List[AmendmentSummary] = Field(default_factory=list)

class LawHistoryDraftRequest(BaseModel):
    articleRef: str
    olderLaw: Optional[str] = ""
    when: Optional[str] = ""
    why: str
    who: str = "Parliament of India"
    officialSourceUrl: str
    sourceDocumentId: Optional[str] = None
    sourcePage: Optional[int] = None
    amendmentNumber: Optional[int] = None
    kind: LawChangeKind = "amended"
    effectiveDate: str = ""
    whatChanged: str = ""
    oldText: Optional[str] = None
    newText: Optional[str] = None
    reason: Optional[str] = None
    reasonSource: Optional[str] = None
    authority: str = "Parliament of India"
    sourceLabel: str = "Official Gazette / legislative.gov.in"
