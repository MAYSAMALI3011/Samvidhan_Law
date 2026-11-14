import json
from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from app.services.ai_router import (
    CANNED_GREETING_RESPONSE,
    NO_SOURCE_RESPONSE,
    stream_chat_response,
)
from app.services.providers import validate_provider_models


@pytest.mark.asyncio
async def test_chat_stream_greeting_zero_provider_calls():
    """Greeting prompt returns canned greeting, zero provider calls, done event last."""
    with patch("app.services.ai_router.stream_provider_completion") as mock_prov:
        stream = stream_chat_response(prompt="Hello there!", user=None, ip_hash="test-ip")
        tokens = []
        done_seen = False
        async for chunk in stream:
            for block in chunk.strip().split("\n\n"):
                lines = [l.strip() for l in block.split("\n") if l.strip()]
                for l in lines:
                    if l.startswith("event: token"):
                        pass
                    elif l.startswith("data: ") and "token" in l:
                        data = json.loads(l[6:])
                        tokens.append(data.get("token"))
                    elif l.startswith("data: ") and "done" in l:
                        done_seen = True

        full_text = "".join([t for t in tokens if t])
        assert CANNED_GREETING_RESPONSE in full_text
        assert done_seen is True
        mock_prov.assert_not_called()


@pytest.mark.asyncio
async def test_chat_stream_no_source_zero_provider_calls():
    """Prompt with no published verified sources returns fixed message with zero provider calls."""
    with patch("app.services.ai_router.get_search_citations", AsyncMock(return_value=[])):
        with patch("app.services.ai_router.stream_provider_completion") as mock_prov:
            stream = stream_chat_response(prompt="What is quantum gravity in space?", user=None, ip_hash="test-ip")
            tokens = []
            done_seen = False
            async for chunk in stream:
                for block in chunk.strip().split("\n\n"):
                    lines = [l.strip() for l in block.split("\n") if l.strip()]
                    for l in lines:
                        if l.startswith("data: ") and "token" in l:
                            tokens.append(json.loads(l[6:]).get("token"))
                        elif l.startswith("data: ") and "done" in l:
                            done_seen = True

            full_text = "".join([t for t in tokens if t])
            assert NO_SOURCE_RESPONSE in full_text
            assert done_seen is True
            mock_prov.assert_not_called()


@pytest.mark.asyncio
async def test_chat_stream_sources_found_all_providers_fail():
    """When verified source is found but all providers fail, returns AI_DEFAULT_ANSWER."""
    mock_citations = [
        {"label": "Article 21 — Protection of Life", "url": "/constitution", "summary": "Right to life and liberty.", "text": "No person shall be deprived..."}
    ]
    with patch("app.services.ai_router.get_search_citations", AsyncMock(return_value=mock_citations)):
        with patch("app.services.ai_router.is_provider_available", return_value=True):
            with patch("app.services.ai_router.stream_provider_completion", side_effect=RuntimeError("Provider 500")):
                stream = stream_chat_response(prompt="What does Article 21 protect?", user=None, ip_hash="test-ip")
                tokens = []
                citations_seen = []
                done_seen = False

                async for chunk in stream:
                    for block in chunk.strip().split("\n\n"):
                        lines = [l.strip() for l in block.split("\n") if l.strip()]
                        for l in lines:
                            if l.startswith("event: citation"):
                                pass
                            elif l.startswith("data: ") and "label" in l:
                                citations_seen.append(json.loads(l[6:]))
                            elif l.startswith("data: ") and "token" in l:
                                tokens.append(json.loads(l[6:]).get("token"))
                            elif l.startswith("data: ") and "done" in l:
                                done_seen = True

                assert len(citations_seen) == 1
                assert "Article 21" in citations_seen[0]["label"]
                full_text = "".join([t for t in tokens if t])
                assert "busy right now" in full_text
                assert done_seen is True


@pytest.mark.asyncio
async def test_chat_stream_provider_success_and_sse_framing():
    """When provider succeeds, streams tokens, parses followups, and emits done last."""
    mock_citations = [
        {"label": "Article 14 — Equality before law", "url": "/constitution", "summary": "Equality before law", "text": "The State shall not deny..."}
    ]

    async def mock_generator(*args, **kwargs):
        yield "Article 14 ensures "
        yield "equality before the law. "
        yield "\n<<<FOLLOWUPS>>>\n[\"What is reasonable classification?\", \"Can foreigners claim Article 14?\"]"

    with patch("app.services.ai_router.get_search_citations", AsyncMock(return_value=mock_citations)):
        with patch("app.services.ai_router.is_provider_available", return_value=True):
            with patch("app.services.ai_router.stream_provider_completion", side_effect=mock_generator):
                with patch("app.services.ai_router.increment_quota_on_success") as mock_quota:
                    stream = stream_chat_response(prompt="Explain Article 14", user=None, ip_hash="test-ip")
                    tokens = []
                    followups = []
                    events_order = []

                    async for chunk in stream:
                        for block in chunk.strip().split("\n\n"):
                            lines = [l.strip() for l in block.split("\n") if l.strip()]
                            for l in lines:
                                if l.startswith("event: "):
                                    events_order.append(l[7:])
                                elif l.startswith("data: "):
                                    data = json.loads(l[6:])
                                    if "token" in data:
                                        t = data["token"]
                                        assert t != ""  # Never emit empty token
                                        tokens.append(t)
                                    elif isinstance(data, list):
                                        followups.extend(data)

                    assert "Article 14 ensures equality before the law." in "".join(tokens)
                    assert len(followups) == 2
                    assert "What is reasonable classification?" in followups[0]
                    assert events_order[-1] == "done"  # done is always last
                    mock_quota.assert_called_once()


@pytest.mark.asyncio
async def test_chat_stream_midstream_error():
    """Mid-stream failure emits event: error followed by event: done."""
    mock_citations = [
        {"label": "Article 32 — Constitutional Remedies", "url": "/constitution", "summary": "Right to move Supreme Court", "text": "Guaranteed remedies..."}
    ]

    async def failing_generator(*args, **kwargs):
        yield "Article 32 guarantees "
        raise RuntimeError("Network disconnected abruptly")

    with patch("app.services.ai_router.get_search_citations", AsyncMock(return_value=mock_citations)):
        with patch("app.services.ai_router.is_provider_available", return_value=True):
            with patch("app.services.ai_router.stream_provider_completion", side_effect=failing_generator):
                stream = stream_chat_response(prompt="Explain Article 32", user=None, ip_hash="test-ip")
                events = []
                async for chunk in stream:
                    for block in chunk.strip().split("\n\n"):
                        for l in block.split("\n"):
                            if l.startswith("event: "):
                                events.append(l[7:].strip())

                assert "error" in events
                assert events[-1] == "done"  # done is always last


@pytest.mark.asyncio
async def test_validate_provider_models_warning(caplog):
    """Model-id validation logs clear warnings without crashing when a model is missing."""
    import logging
    caplog.set_level(logging.WARNING)

    # Mock provider endpoints response returning different model list
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"data": [{"id": "gemini-2.5-flash"}, {"id": "gemini-flash-latest"}]}

    with patch("httpx.AsyncClient.get", AsyncMock(return_value=mock_resp)):
        with patch("app.config.settings.GEMINI_API_KEY", "test-key"):
            with patch("app.config.settings.GEMINI_MODEL", "gemini-nonexistent-model"):
                results = await validate_provider_models()
                assert results.get("gemini") is False
                assert "was not found in provider model list" in caplog.text
