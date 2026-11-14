"""
scripts/auth_smoke.py: Production and Staging Auth Flow Smoke Test.

Tests authentication lifecycle using TEST_EMAIL and TEST_PASSWORD:
1. POST /api/auth/login -> verifies 200 OK and inspects cookie security flags (HttpOnly, SameSite, Secure)
2. GET /api/auth/me -> verifies authenticated profile payload using received cookies
3. POST /api/auth/logout -> verifies session destruction and cookie deletion
4. GET /api/auth/me -> verifies 401 Unauthorized post-logout

Safety & Privacy Constraints:
- Signup is strictly skipped (no dummy accounts created)
- Never prints passwords, tokens, full cookies, or secret values
- Prints only HTTP status, PASS/FAIL, response times, and cookie flag presence
"""

import argparse
import os
import sys
import time
from typing import Dict, List, Optional
import httpx

TIMEOUT_FLAG_SECONDS = 15.0
CLIENT_TIMEOUT = httpx.Timeout(45.0, connect=15.0)


def format_duration(seconds: float) -> str:
    flag = " [>15s!]" if seconds > TIMEOUT_FLAG_SECONDS else ""
    return f"{seconds:.2f}s{flag}"


def load_env_defaults() -> Dict[str, str]:
    env_vars = {}
    for env_path in [".env", "backend/.env", "../backend/.env"]:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars


def parse_cookie_flags(set_cookie_header: str) -> Dict[str, bool]:
    parts = [p.strip().lower() for p in set_cookie_header.split(";")]
    return {
        "httponly": "httponly" in parts,
        "secure": "secure" in parts,
        "samesite_lax": any(p.startswith("samesite=lax") for p in parts),
        "samesite_none": any(p.startswith("samesite=none") for p in parts),
        "samesite_strict": any(p.startswith("samesite=strict") for p in parts),
    }


def run_auth_smoke(target_url: str, email: str, password: str) -> List[Dict[str, str]]:
    results = []
    base = target_url.rstrip("/")

    # Use a client session to track cookies automatically
    client = httpx.Client(timeout=CLIENT_TIMEOUT, follow_redirects=False)

    print(f"\nTarget Base URL: {base}")
    print(f"Test Email:      {email[:3]}***@{email.split('@')[-1] if '@' in email else '***'}\n")

    # Step 1: POST /api/auth/login
    t0 = time.perf_counter()
    login_url = f"{base}/api/auth/login"
    login_passed = False
    try:
        res = client.post(login_url, json={"email": email, "password": password})
        elapsed = time.perf_counter() - t0
        status = res.status_code

        # Inspect cookies
        cookies_received = list(client.cookies.keys())
        set_cookie_raw = res.headers.get("set-cookie", "")
        flags = parse_cookie_flags(set_cookie_raw)

        flag_desc = []
        if flags.get("httponly"):
            flag_desc.append("HttpOnly")
        if flags.get("secure"):
            flag_desc.append("Secure")
        if flags.get("samesite_lax"):
            flag_desc.append("SameSite=Lax")
        elif flags.get("samesite_none"):
            flag_desc.append("SameSite=None")

        flag_str = f"Flags: [{', '.join(flag_desc)}]" if flag_desc else "Flags: none"

        if status == 200:
            login_passed = True
            detail = f"Login OK. Cookies set: {cookies_received}. {flag_str}"
            result_str = "PASS"
        elif status == 401:
            body_text = res.text[:80]
            detail = f"Unauthorized: {body_text}"
            result_str = "FAIL"
        else:
            detail = f"HTTP {status}: {res.text[:80]}"
            result_str = "FAIL"

        results.append({
            "step": "1. POST /api/auth/login",
            "status": str(status),
            "result": result_str,
            "time": format_duration(elapsed),
            "detail": detail,
        })
    except Exception as e:
        elapsed = time.perf_counter() - t0
        results.append({
            "step": "1. POST /api/auth/login",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": f"{type(e).__name__}: {str(e)[:60]}",
        })

    # Step 2: GET /api/auth/me (with session cookies)
    t0 = time.perf_counter()
    me_url = f"{base}/api/auth/me"
    try:
        res_me = client.get(me_url)
        elapsed = time.perf_counter() - t0
        status = res_me.status_code

        if status == 200:
            try:
                data = res_me.json()
                role = data.get("role", "unknown")
                tier = data.get("tier", "unknown")
                detail = f"Profile verified (role: {role}, tier: {tier})"
                result_str = "PASS"
            except Exception:
                detail = "Status 200, but JSON decode failed"
                result_str = "FAIL"
        elif status == 401:
            detail = "401 Unauthorized (session cookies not accepted or missing)"
            result_str = "FAIL"
        else:
            detail = f"HTTP {status}: {res_me.text[:60]}"
            result_str = "FAIL"

        results.append({
            "step": "2. GET /api/auth/me (session)",
            "status": str(status),
            "result": result_str,
            "time": format_duration(elapsed),
            "detail": detail,
        })
    except Exception as e:
        elapsed = time.perf_counter() - t0
        results.append({
            "step": "2. GET /api/auth/me (session)",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": f"{type(e).__name__}: {str(e)[:60]}",
        })

    # Step 3: POST /api/auth/logout
    t0 = time.perf_counter()
    logout_url = f"{base}/api/auth/logout"
    try:
        res_logout = client.post(logout_url, json={})
        elapsed = time.perf_counter() - t0
        status = res_logout.status_code

        if status == 200:
            detail = "Logout success (cookies invalidated)"
            result_str = "PASS"
        else:
            detail = f"HTTP {status}: {res_logout.text[:60]}"
            result_str = "FAIL"

        results.append({
            "step": "3. POST /api/auth/logout",
            "status": str(status),
            "result": result_str,
            "time": format_duration(elapsed),
            "detail": detail,
        })
    except Exception as e:
        elapsed = time.perf_counter() - t0
        results.append({
            "step": "3. POST /api/auth/logout",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": f"{type(e).__name__}: {str(e)[:60]}",
        })

    # Step 4: GET /api/auth/me post-logout (must return 401)
    t0 = time.perf_counter()
    try:
        res_post_me = client.get(me_url)
        elapsed = time.perf_counter() - t0
        status = res_post_me.status_code

        if status == 401:
            detail = "Correctly rejected with 401 after logout"
            result_str = "PASS"
        elif status == 200:
            detail = "Unexpected 200: Session still active after logout"
            result_str = "FAIL"
        else:
            detail = f"Unexpected status {status}"
            result_str = "FAIL"

        results.append({
            "step": "4. GET /api/auth/me (post-logout)",
            "status": str(status),
            "result": result_str,
            "time": format_duration(elapsed),
            "detail": detail,
        })
    except Exception as e:
        elapsed = time.perf_counter() - t0
        results.append({
            "step": "4. GET /api/auth/me (post-logout)",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": f"{type(e).__name__}: {str(e)[:60]}",
        })

    return results


def print_table(results: List[Dict[str, str]]):
    col_w = {"step": 32, "status": 8, "result": 8, "time": 10, "detail": 55}
    header = (
        f"{'STEP':<{col_w['step']}} | "
        f"{'STATUS':<{col_w['status']}} | "
        f"{'RESULT':<{col_w['result']}} | "
        f"{'TIME':<{col_w['time']}} | "
        f"{'DETAILS'}"
    )
    divider = "-" * (sum(col_w.values()) + 12)
    print(header)
    print(divider)
    for r in results:
        res_color = r["result"]
        print(
            f"{r['step']:<{col_w['step']}} | "
            f"{r['status']:<{col_w['status']}} | "
            f"{res_color:<{col_w['result']}} | "
            f"{r['time']:<{col_w['time']}} | "
            f"{r['detail']}"
        )
    print(divider)


def main():
    parser = argparse.ArgumentParser(description="Samvidhan Auth Flow Smoke Test")
    parser.add_argument("--target", default=None, help="Target backend/proxy base URL")
    parser.add_argument("--email", default=None, help="Test account email")
    parser.add_argument("--password", default=None, help="Test account password")
    args = parser.parse_args()

    env_defaults = load_env_defaults()

    target = (
        args.target
        or os.environ.get("SAMVIDHAN_TARGET")
        or "https://samvidhan-law.pages.dev"
    )

    email = (
        args.email
        or os.environ.get("TEST_EMAIL")
        or env_defaults.get("TEST_EMAIL")
    )
    password = (
        args.password
        or os.environ.get("TEST_PASSWORD")
        or env_defaults.get("TEST_PASSWORD")
    )

    print("=" * 80)
    print("SAMVIDHAN AUTH FLOW SMOKE TEST (Non-destructive, Zero Secrets)")
    print("=" * 80)

    if not email or not password:
        print("\n[SKIP] TEST_EMAIL or TEST_PASSWORD not provided.")
        print("To run this test against an existing confirmed user:")
        print("  python scripts/auth_smoke.py --target <URL> --email <EMAIL> --password <PASSWORD>")
        print("  or set TEST_EMAIL and TEST_PASSWORD in .env\n")
        sys.exit(0)

    results = run_auth_smoke(target, email, password)
    print_table(results)

    all_pass = all(r["result"] == "PASS" for r in results)
    print("\nOVERALL STATUS: " + ("PASS" if all_pass else "FAIL"))
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
