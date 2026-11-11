import json
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

# Cooldown and failure tracking: provider_name -> unix timestamp until cooled down
_cooldowns: Dict[str, float] = {}
_failures: Dict[str, int] = {}
_minute_requests: Dict[str, List[float]] = {}


PROVIDER_ENDPOINTS = {
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "get_key": lambda: settings.GEMINI_API_KEY,
        "get_model": lambda: settings.GEMINI_MODEL,
        "rpm": lambda: settings.GEMINI_RPM,
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1/chat/completions",
        "get_key": lambda: settings.GROQ_API_KEY,
        "get_model": lambda: settings.GROQ_MODEL,
        "rpm": lambda: settings.GROQ_RPM,
    },
    "mistral": {
        "base_url": "https://api.mistral.ai/v1/chat/completions",
        "get_key": lambda: settings.MISTRAL_API_KEY,
        "get_model": lambda: settings.MISTRAL_MODEL,
        "rpm": lambda: settings.MISTRAL_RPM,
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1/chat/completions",
        "get_key": lambda: settings.OPENROUTER_API_KEY,
        "get_model": lambda: settings.OPENROUTER_MODEL,
        "rpm": lambda: settings.OPENROUTER_RPM,
    },
}


def is_provider_available(name: str) -> bool:
    if name not in PROVIDER_ENDPOINTS:
        return False
    conf = PROVIDER_ENDPOINTS[name]
    key = conf["get_key"]()
    if not key or not key.strip():
        return False

    now = time.time()
    if name in _cooldowns and now < _cooldowns[name]:
        return False

    # Proactive RPM check if configured
    rpm = conf["rpm"]()
    if rpm:
        timestamps = _minute_requests.get(name, [])
        valid_ts = [t for t in timestamps if now - t < 60.0]
        _minute_requests[name] = valid_ts
        if len(valid_ts) >= rpm:
            return False

    return True


def record_provider_success(name: str) -> None:
    _failures[name] = 0
    now = time.time()
    _minute_requests.setdefault(name, []).append(now)


def record_provider_failure(name: str, status_code: Optional[int] = None, retry_after: Optional[int] = None) -> None:
    now = time.time()
    _failures[name] = _failures.get(name, 0) + 1
    fail_count = _failures[name]

    if status_code == 429:
        cooldown_sec = retry_after if retry_after and retry_after > 0 else 60.0
        _cooldowns[name] = now + cooldown_sec
        logger.warning(f"AI Provider {name} rate limited (429). Cooldown: {cooldown_sec}s.")
    elif fail_count >= 3:
        # Long cooldown: 15 minutes after 3 consecutive failures
        _cooldowns[name] = now + 900.0
        logger.warning(f"AI Provider {name} failed 3 times consecutively. Long cooldown: 15m.")
    elif status_code in [400, 401]:
        # Misconfiguration: cooldown 1 hour
        _cooldowns[name] = now + 3600.0
        logger.error(f"AI Provider {name} returned misconfiguration error ({status_code}). Cooldown 1h.")
    else:
        # Transient failure cooldown
        _cooldowns[name] = now + 30.0


async def stream_provider_completion(
    provider_name: str,
    messages: List[Dict[str, str]],
) -> AsyncGenerator[str, None]:
    """
    Streams raw token deltas from OpenAI-compatible provider endpoints.
    """
    conf = PROVIDER_ENDPOINTS[provider_name]
    url = conf["base_url"]
    api_key = conf["get_key"]()
    model = conf["get_model"]()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 700,
        "stream": True,
    }

    timeout = httpx.Timeout(settings.AI_REQUEST_TIMEOUT_SECONDS, connect=8.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code != 200:
                retry_header = response.headers.get("retry-after")
                retry_val = int(retry_header) if retry_header and retry_header.isdigit() else None
                record_provider_failure(provider_name, response.status_code, retry_val)
                raise RuntimeError(f"Provider {provider_name} returned status {response.status_code}")

            record_provider_success(provider_name)

            async for line in response.aiter_lines():
                if not line or not line.strip():
                    continue
                line_str = line.strip()
                if line_str.startswith("data: "):
                    data_part = line_str[6:].strip()
                    if data_part == "[DONE]":
                        break
                    try:
                        parsed = json.loads(data_part)
                        choices = parsed.get("choices", [])
                        if choices:
                            delta = choices[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except json.JSONDecodeError:
                        continue
