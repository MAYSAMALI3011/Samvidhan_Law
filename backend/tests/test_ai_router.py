import pytest
from pydantic import ValidationError
from app.config import Settings
from app.services.providers import (
    is_provider_available,
    record_provider_failure,
    record_provider_success,
    _cooldowns,
    _failures,
)


def test_openrouter_model_enforces_free_suffix():
    # Valid model with :free
    s = Settings(OPENROUTER_MODEL="google/gemini-flash:free")
    assert s.OPENROUTER_MODEL == "google/gemini-flash:free"

    # Invalid paid model without :free must be rejected at config level
    with pytest.raises(ValidationError):
        Settings(OPENROUTER_MODEL="anthropic/claude-3-opus")


def test_provider_cooldown_and_failover_logic():
    name = "groq"
    record_provider_failure(name, status_code=429, retry_after=30)
    assert is_provider_available(name) is False

    # 3 failures triggers 15 minute long cooldown
    _failures[name] = 3
    record_provider_failure(name, status_code=500)
    assert is_provider_available(name) is False
