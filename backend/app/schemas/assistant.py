from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    conversationId: Optional[str] = None


class ConversationSummary(BaseModel):
    id: str
    title: str
    createdAt: str
    updatedAt: str


class MessageItem(BaseModel):
    id: str
    role: str  # 'user' | 'assistant'
    content: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    nextSteps: List[str] = Field(default_factory=list)
    createdAt: str
