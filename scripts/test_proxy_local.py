import httpx
import time

def main():
    print("Testing Wrangler Pages proxy on http://127.0.0.1:8788")
    client = httpx.Client(base_url="http://127.0.0.1:8788", timeout=30.0)

    # 1. 401 Passthrough on unauthenticated /api/auth/me
    r_me = client.get("/api/auth/me")
    print(f"1. GET /api/auth/me (no cookie)")
    print(f"   Status: {r_me.status_code} (Expected: 401)")
    print(f"   Body:   {r_me.text[:90]}")
    assert r_me.status_code == 401, f"Expected 401, got {r_me.status_code}"

    # 2. CORS Preflight OPTIONS /api/auth/login
    r_opt = client.options("/api/auth/login", headers={"Origin": "http://127.0.0.1:8788", "Access-Control-Request-Method": "POST"})
    print(f"2. OPTIONS /api/auth/login")
    print(f"   Status: {r_opt.status_code}")

    # 3. Chatbot SSE streaming via proxy
    print(f"3. POST /api/assistant/chat (SSE streaming via proxy)")
    t0 = time.time()
    events = []
    with client.stream("POST", "/api/assistant/chat", json={"prompt": "Hello"}) as res:
        ct = res.headers.get("content-type", "")
        print(f"   Status: {res.status_code}, Content-Type: {ct}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        for line in res.iter_lines():
            line_str = line.strip()
            if line_str:
                events.append((time.time() - t0, line_str))
                print(f"   [SSE T+{time.time() - t0:.2f}s] {line_str[:75]}")

    print(f"   Total events received: {len(events)}")
    assert len(events) > 0, "Expected at least one SSE event"
    print("\n[SUCCESS] Local Wrangler Pages Function proxy verified successfully!")

if __name__ == "__main__":
    main()
