# -*- coding: utf-8 -*-
"""
Pydantic response models for Constitution Provisions, Search, Amendments, and Law History.
Matches frontend types in src/types/index.ts and zod schemas.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


LawStatus = Literal["in_force", "amended", "omitted", "repealed", "substituted", "proposed"]
LawChangeKind = Literal["original", "amended", "inserted", "omitted", "replaced", "proposed", "substituted"]


class LawHistoryEntry(BaseModel):
    id: str
    kind: LawChangeKind
    effectiveDate: str
    whatChanged: str
    oldText: Optional[str] = None
    newText: Optional[str] = None
    reason: str
    reasonSource: Optional[str] = None
    changedBy: str
    authority: str
    sourceLabel: str
    sourceUrl: str
    verifiedOn: str
    isSample: Optional[bool] = False


class LawHistory(BaseModel):
    currentStatus: LawStatus
    lastVerifiedOn: str
    entries: List[LawHistoryEntry] = Field(default_factory=list)


class SourceRef(BaseModel):
    label: str
    url: str


class ProvisionSummary(BaseModel):
    kind: str
    articleNo: str
    heading: str
    partNo: Optional[str] = None
    partTitle: Optional[str] = None


class ProvisionDetail(BaseModel):
    articleNo: str
    heading: str
    partNo: Optional[str] = None
    partTitle: Optional[str] = None
    body: str
    asOnDate: str
    source: SourceRef
    lawHistory: Optional[LawHistory] = None


class AmendmentItem(BaseModel):
    number: int
    title: str
    year: Optional[int] = None
    assentDate: Optional[str] = None
    source: SourceRef
    hasReasons: bool = False
