import json
import pytest
from app.services.ai_router import stream_chat_response


@pytest.mark.asyncio
async def test_chat_stream_default_fallback_and_sse_protocol():
    """
    Verifies that when no providers have keys configured,
    the router streams AI_DEFAULT_ANSWER and finishes with done.
    Parses with Python re-implementation of frontend useChatStream logic.
    """
    stream = stream_chat_response(
        prompt="What is Article 21?",
        user=None,
        ip_hash="test-stream-ip",
    )

    tokens = []
    done_event = None

    async for chunk in stream:
        # Split on double newline per SSE specification
        blocks = chunk.strip().split("\n\n")
        for block in blocks:
            lines = [line.strip() for line in block.split("\n") if line.strip()]
            event_type = None
            data_val = None
            for line in lines:
                if line.startswith("event: "):
                    event_type = line[7:].strip()
                elif line.startswith("data: "):
                    data_val = json.loads(line[6:].strip())

            if event_type == "token" and data_val:
                t = data_val.get("token")
                assert t != ""  # Never emit empty token
                tokens.append(t)
            elif event_type == "done" and data_val:
                done_event = data_val

    # Default answer streamed
    full_text = "".join(tokens)
    assert "busy right now" in full_text
    assert done_event is not None
    assert done_event.get("done") is True
