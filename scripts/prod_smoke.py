import argparse
import os
import sys
import time
from typing import Dict, List, Optional
import httpx

TIMEOUT_FLAG_SECONDS = 15.0
CLIENT_TIMEOUT = httpx.Timeout(90.0, connect=30.0)


def format_duration(seconds: float) -> str:
    flag = " [>15s!]" if seconds > TIMEOUT_FLAG_SECONDS else ""
    return f"{seconds:.2f}s{flag}"


def check_health(client: httpx.Client, backend: str) -> Dict[str, str]:
    url = f"{backend.rstrip('/')}/health"
    t0 = time.perf_counter()
    try:
        r = client.get(url)
        elapsed = time.perf_counter() - t0
        passed = r.status_code == 200
        reason = "Returned status 200 OK" if passed else f"Unexpected response body: {r.text[:60]}"
        return {
            "check": "GET /health",
            "status": str(r.status_code),
            "result": "PASS" if passed else "FAIL",
            "time": format_duration(elapsed),
            "detail": reason,
        }
    except Exception as e:
        elapsed = time.perf_counter() - t0
        return {
            "check": "GET /health",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": type(e).__name__,
        }


def check_cors_preflight(client: httpx.Client, backend: str, path: str, origin: str) -> Dict[str, str]:
    url = f"{backend.rstrip('/')}{path}"
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,accept",
    }
    t0 = time.perf_counter()
    try:
        r = client.options(url, headers=headers)
        elapsed = time.perf_counter() - t0
        allow_origin = r.headers.get("access-control-allow-origin", "MISSING")
        allow_credentials = r.headers.get("access-control-allow-credentials", "MISSING")
        allow_headers = r.headers.get("access-control-allow-headers", "MISSING")
        passed = (
            r.status_code in (200, 204)
            and (allow_origin == origin or allow_origin == "*")
        )
        detail = f"Origin: {allow_origin} | Creds: {allow_credentials} | Headers: {allow_headers}"
        return {
            "check": f"CORS OPTIONS {path}",
            "status": str(r.status_code),
            "result": "PASS" if passed else "FAIL",
            "time": format_duration(elapsed),
            "detail": detail,
        }
    except Exception as e:
        elapsed = time.perf_counter() - t0
        return {
            "check": f"CORS OPTIONS {path}",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": type(e).__name__,
        }


def check_auth_me_unauthed(client: httpx.Client, backend: str) -> Dict[str, str]:
    url = f"{backend.rstrip('/')}/api/auth/me"
    t0 = time.perf_counter()
    try:
        r = client.get(url)
        elapsed = time.perf_counter() - t0
        passed = r.status_code == 401
        detail = "Returned 401 as expected for unauthenticated guest" if passed else f"Expected 401, got {r.status_code}: {r.text[:60]}"
        return {
            "check": "GET /api/auth/me (no cookie)",
            "status": str(r.status_code),
            "result": "PASS" if passed else "FAIL",
            "time": format_duration(elapsed),
            "detail": detail,
        }
    except Exception as e:
        elapsed = time.perf_counter() - t0
        return {
            "check": "GET /api/auth/me (no cookie)",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": type(e).__name__,
        }


def check_assistant_chat(client: httpx.Client, backend: str, origin: str) -> Dict[str, str]:
    url = f"{backend.rstrip('/')}/api/assistant/chat"
    payload = {"prompt": "What does Article 21 protect?"}
    headers = {
        "Origin": origin,
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    t0 = time.perf_counter()
    try:
        with client.stream("POST", url, json=payload, headers=headers) as r:
            elapsed_first_byte = time.perf_counter() - t0
            status_code = r.status_code

            if status_code == 429:
                return {
                    "check": "POST /api/assistant/chat",
                    "status": "429",
                    "result": "PASS",
                    "time": format_duration(elapsed_first_byte),
                    "detail": "Classification: quota_429",
                }

            if status_code >= 400:
                body_peek = r.read().decode("utf-8", errors="ignore")[:80]
                return {
                    "check": "POST /api/assistant/chat",
                    "status": str(status_code),
                    "result": "FAIL",
                    "time": format_duration(elapsed_first_byte),
                    "detail": f"Classification: http_error ({body_peek})",
                }

            events: List[str] = []
            tokens: List[str] = []
            first_token_snippet = ""

            for line in r.iter_lines():
                if line.startswith("event:"):
                    evt = line.split(":", 1)[1].strip()
                    events.append(evt)
                elif line.startswith("data:"):
                    data_str = line.split(":", 1)[1].strip()
                    if data_str:
                        tokens.append(data_str)
                        if not first_token_snippet:
                            first_token_snippet = data_str[:120]

            elapsed_total = time.perf_counter() - t0
            full_content = " ".join(tokens)

            # Classify outcome
            if "no verified source" in full_content.lower():
                classification = "no_verified_source_message"
            elif "constitutional" in full_content.lower() or "article 21" in full_content.lower() or "life" in full_content.lower():
                classification = "grounded_answer"
            elif "assistant is currently busy" in full_content.lower() or "please try again" in full_content.lower():
                classification = "default_answer_all_providers_failed"
            elif len(tokens) > 0:
                classification = f"grounded_answer (tokens={len(tokens)})"
            else:
                classification = "empty_stream"

            passed = status_code == 200 and len(events) > 0
            detail = f"Events: {events[:6]} | Tokens: {len(tokens)} | First snippet: {first_token_snippet[:60]} | Class: {classification}"
            return {
                "check": "POST /api/assistant/chat",
                "status": str(status_code),
                "result": "PASS" if passed else "FAIL",
                "time": format_duration(elapsed_total),
                "detail": detail,
            }
    except httpx.TimeoutException:
        elapsed = time.perf_counter() - t0
        return {
            "check": "POST /api/assistant/chat",
            "status": "TIMEOUT",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": "Classification: timeout (Render service may be sleeping or stalling)",
        }
    except Exception as e:
        elapsed = time.perf_counter() - t0
        return {
            "check": "POST /api/assistant/chat",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": f"Classification: http_error ({type(e).__name__})",
        }


def check_login_and_session(client: httpx.Client, backend: str, origin: str) -> Optional[Dict[str, str]]:
    email = os.environ.get("TEST_EMAIL")
    password = os.environ.get("TEST_PASSWORD")
    if not email or not password:
        return {
            "check": "POST /api/auth/login + session",
            "status": "SKIP",
            "result": "INFO",
            "time": "-",
            "detail": "TEST_EMAIL / TEST_PASSWORD not set; login check skipped.",
        }

    url_login = f"{backend.rstrip('/')}/api/auth/login"
    url_me = f"{backend.rstrip('/')}/api/auth/me"
    headers = {"Origin": origin, "Content-Type": "application/json"}
    payload = {"email": email, "password": password}

    t0 = time.perf_counter()
    try:
        r = client.post(url_login, json=payload, headers=headers)
        elapsed = time.perf_counter() - t0

        set_cookies = r.headers.get_list("set-cookie") if hasattr(r.headers, "get_list") else r.headers.get("set-cookie", "").split(",")
        flags_found: List[str] = []
        for c in set_cookies:
            # Parse attributes only, NEVER values
            parts = [p.strip() for p in c.split(";")]
            cookie_name = parts[0].split("=")[0].strip() if parts else "unknown"
            attrs = [p.split("=")[0].strip() for p in parts[1:]]
            flags_found.append(f"Cookie: {cookie_name} [Attrs: {', '.join(attrs)}]")

        if r.status_code != 200:
            return {
                "check": "POST /api/auth/login + session",
                "status": str(r.status_code),
                "result": "FAIL",
                "time": format_duration(elapsed),
                "detail": f"Login failed with status {r.status_code}",
            }

        # Check me with session
        r_me = client.get(url_me)
        session_persisted = r_me.status_code == 200
        detail = f"Session Persisted: {session_persisted} (Status {r_me.status_code}) | {'; '.join(flags_found)}"
        return {
            "check": "POST /api/auth/login + session",
            "status": str(r_me.status_code),
            "result": "PASS" if session_persisted else "FAIL",
            "time": format_duration(elapsed),
            "detail": detail,
        }
    except Exception as e:
        elapsed = time.perf_counter() - t0
        return {
            "check": "POST /api/auth/login + session",
            "status": "ERR",
            "result": "FAIL",
            "time": format_duration(elapsed),
            "detail": type(e).__name__,
        }


def main():
    parser = argparse.ArgumentParser(description="Samvidhan Production Smoke Test")
    parser.add_argument("--backend", default="https://samvidhan-law.onrender.com", help="Backend base URL")
    parser.add_argument("--origin", default="https://samvidhan-law.pages.dev", help="Frontend origin")
    args = parser.parse_args()

    print("=" * 80)
    print("SAMVIDHAN PRODUCTION SMOKE TEST")
    print(f"Backend Target: {args.backend}")
    print(f"Origin Header:  {args.origin}")
    print("=" * 80)

    results: List[Dict[str, str]] = []

    with httpx.Client(timeout=CLIENT_TIMEOUT) as client:
        # 1. Health
        results.append(check_health(client, args.backend))

        # 2. CORS Preflight for Login and Chat
        results.append(check_cors_preflight(client, args.backend, "/api/auth/login", args.origin))
        results.append(check_cors_preflight(client, args.backend, "/api/assistant/chat", args.origin))

        # 3. Auth Me without cookies
        results.append(check_auth_me_unauthed(client, args.backend))

        # 4. Assistant Chat
        results.append(check_assistant_chat(client, args.backend, args.origin))

        # 5. Optional Login
        login_res = check_login_and_session(client, args.backend, args.origin)
        if login_res:
            results.append(login_res)

    # Print Table
    print(f"{'CHECK':<32} | {'STATUS':<7} | {'RESULT':<6} | {'TIME':<10} | {'DETAILS'}")
    print("-" * 105)
    for res in results:
        print(f"{res['check']:<32} | {res['status']:<7} | {res['result']:<6} | {res['time']:<10} | {res['detail']}")
    print("=" * 80)


if __name__ == "__main__":
    main()
