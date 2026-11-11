import pytest
from app.schemas.user import UserProfile
from app.services.quota import check_and_get_quota, increment_quota_on_success


def test_free_user_quota_enforcement():
    user = UserProfile(
        id="usr-free-1",
        name="Free Learner",
        email="free@example.com",
        tier="free",
        aiUsageToday=0,
    )
    ip_hash = "mock-ip-hash"

    # 1 to 5 allowed
    for i in range(5):
        allowed, q = check_and_get_quota(user, ip_hash)
        assert allowed is True
        increment_quota_on_success(user, ip_hash)

    # 6th request rejected with 429 info
    allowed, q = check_and_get_quota(user, ip_hash)
    assert allowed is False
    assert q["success"] is False
    assert q["dailyLimit"] == 5
    assert q["retryAfter"] > 0
    assert "Daily AI question limit reached" in q["message"]


def test_pro_user_unlimited_quota():
    user = UserProfile(
        id="usr-pro-1",
        name="Pro Member",
        email="pro@example.com",
        tier="pro",
        aiUsageToday=10,
    )
    ip_hash = "mock-ip-hash"

    allowed, q = check_and_get_quota(user, ip_hash)
    assert allowed is True
    assert q["dailyLimit"] is None


def test_guest_quota_enforcement():
    ip_hash = "unique-guest-ip-hash"

    # Guest allowed 3 requests
    for i in range(3):
        allowed, q = check_and_get_quota(None, ip_hash)
        assert allowed is True
        increment_quota_on_success(None, ip_hash)

    # 4th request rejected
    allowed, q = check_and_get_quota(None, ip_hash)
    assert allowed is False
    assert q["dailyLimit"] == 3
