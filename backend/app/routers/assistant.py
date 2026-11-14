from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse
from app.deps import get_current_user, get_current_user_optional
from app.schemas.assistant import ChatRequest, ConversationSummary, MessageItem
from app.schemas.user import UserProfile
from app.security import hash_ip
from app.services.ai_router import stream_chat_response
from app.services.quota import check_and_get_quota
from app.supabase_client import get_supabase_admin_client

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


def get_client_ip(request: Request) -> str:
    # First hop of X-Forwarded-For or client.host
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        first_hop = forwarded.split(",")[0].strip()
        if first_hop:
            return first_hop
    return request.client.host if request.client else "127.0.0.1"


@router.post("/chat")
async def chat_stream(
    payload: ChatRequest,
    request: Request,
    response: Response,
    user: Optional[UserProfile] = Depends(get_current_user_optional),
):
    ip_raw = get_client_ip(request)
    ip_hashed = hash_ip(ip_raw)

    # 1. Quota Check BEFORE streaming starts
    allowed, quota_info = check_and_get_quota(user, ip_hashed)
    if not allowed:
        retry_after = quota_info.get("retryAfter", 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=quota_info.get("message", "Daily AI question limit reached."),
            headers={"Retry-After": str(retry_after)},
        )

    # 2. SSE Streaming Response
    stream = stream_chat_response(
        prompt=payload.prompt,
        user=user,
        ip_hash=ip_hashed,
        conversation_id=payload.conversationId,
    )

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/conversations", response_model=List[ConversationSummary])
async def list_conversations(user: UserProfile = Depends(get_current_user)):
    supabase = get_supabase_admin_client()
    if not supabase:
        return []
    res = (
        supabase.table("conversations")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", desc=True)
        .limit(20)
        .execute()
    )
    if not res or not res.data:
        return []
    return [
        ConversationSummary(
            id=item["id"],
            title=item["title"],
            createdAt=item["created_at"],
            updatedAt=item["updated_at"],
        )
        for item in res.data
    ]


@router.get("/conversations/{conversation_id}", response_model=List[MessageItem])
async def get_conversation_messages(
    conversation_id: str,
    user: UserProfile = Depends(get_current_user),
):
    supabase = get_supabase_admin_client()
    if not supabase:
        return []
    res = (
        supabase.table("messages")
        .select("id, role, content, sources, next_steps, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    if not res or not res.data:
        return []
    return [
        MessageItem(
            id=item["id"],
            role=item["role"],
            content=item["content"],
            sources=item.get("sources") or [],
            nextSteps=item.get("next_steps") or [],
            createdAt=item["created_at"],
        )
        for item in res.data
    ]


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: UserProfile = Depends(get_current_user),
):
    supabase = get_supabase_admin_client()
    if supabase:
        supabase.table("conversations").delete().eq("id", conversation_id).eq("user_id", user.id).execute()
    return {"success": True}
