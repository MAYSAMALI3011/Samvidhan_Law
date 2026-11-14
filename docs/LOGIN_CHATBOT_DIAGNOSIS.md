# Samvidhan Production Diagnosis: Login and Chatbot

**Date:** 2026-11-14  
**Frontend URL:** `https://samvidhan-law.pages.dev`  
**Backend URL:** `https://samvidhan-law.onrender.com`  
**Database & Auth:** Supabase Free Tier  
**Diagnostic Tools:** `scripts/prod_smoke.py`, `scripts/check_providers.py`, GoTrue direct API inspection  

---

## 1. Executive Summary & Smoke Test Evidence

We executed automated diagnostic probes against the live Render production backend (`https://samvidhan-law.onrender.com`) and local provider verification.

### Raw Smoke Test Output (`scripts/prod_smoke.py`)
```
================================================================================
SAMVIDHAN PRODUCTION SMOKE TEST
Backend Target: https://samvidhan-law.onrender.com
Origin Header:  https://samvidhan-law.pages.dev
================================================================================
CHECK                            | STATUS  | RESULT | TIME       | DETAILS
---------------------------------------------------------------------------------------------------------
GET /health                      | 200     | PASS   | 0.31s      | Returned status 200 OK
CORS OPTIONS /api/auth/login     | 200     | PASS   | 0.30s      | Origin: https://samvidhan-law.pages.dev | Creds: true | Headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type, Idempotency-Key, X-CSRF-Token, X-Forwarded-For
CORS OPTIONS /api/assistant/chat | 200     | PASS   | 0.25s      | Origin: https://samvidhan-law.pages.dev | Creds: true | Headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type, Idempotency-Key, X-CSRF-Token, X-Forwarded-For
GET /api/auth/me (no cookie)     | 401     | PASS   | 0.28s      | Returned 401 as expected for unauthenticated guest
POST /api/assistant/chat         | 200     | PASS   | 6.22s      | Events: ['token', 'done'] | Tokens: 2 | First snippet: {"token": "Our AI assistant is very busy right now. Please t | Class: default_answer_all_providers_failed
POST /api/auth/login + session   | SKIP    | INFO   | -          | TEST_EMAIL / TEST_PASSWORD not set; login check skipped.
================================================================================
```

### Raw AI Provider Audit Output (`scripts/check_providers.py`)
```
===========================================================================
SAMVIDHAN AI PROVIDER DIAGNOSTIC (Reading .env)
===========================================================================
Configured Provider Order: gemini, groq, mistral, openrouter

[GEMINI]
  Configured Model ID: gemini-2.0-flash
  [FAIL] List Models: Model 'gemini-2.0-flash' NOT found in provider model list!
         Suggested current models: ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite']
  [FAIL] Completion: HTTP 404 (Model ID Not Found by Provider)

[GROQ]
  Configured Model ID: llama-3.3-70b-versatile
  [FAIL] List Models: Model 'llama-3.3-70b-versatile' NOT found in provider model list!
         Suggested current models: ['qwen/qwen3.8-27b']
  [FAIL] Completion: HTTP 404 (Model ID Not Found by Provider)

[MISTRAL] SKIPPED: Key is empty or unset in .env

[OPENROUTER]
  Configured Model ID: google/gemini-2.0-flash-exp:free
  [FAIL] List Models: Model 'google/gemini-2.0-flash-exp:free' NOT found in provider model list!
         Suggested current models: ['inclusionai/ling-3.2-flash:free', 'baidu/ernie-5.5-flash-preview:free']
  [FAIL] Completion: HTTP 404 (Model ID Not Found by Provider)
===========================================================================
```

---

## 2. Ranked Root Causes: Chatbot Failure

### Rank 1: All Configured AI Model IDs Return HTTP 404 Not Found (Primary Cause)
* **Evidence:** Running live completions against the APIs for all configured providers returned **HTTP 404**:
  * Gemini: `gemini-2.0-flash` -> 404 Not Found (current valid model: `gemini-2.5-flash` or `gemini-flash-latest`).
  * Groq: `llama-3.3-70b-versatile` -> 404 Not Found (current valid free model: `qwen/qwen3.8-27b`).
  * OpenRouter: `google/gemini-2.0-flash-exp:free` -> 404 Not Found (decommissioned by provider).
* **Consequence:** `ai_router.py` attempts provider #1 (Gemini) -> fails (404); fails over to #2 (Groq) -> fails (404); fails over to #3 (OpenRouter) -> fails (404). When all providers fail, it returns `default_answer_all_providers_failed`: `"Our AI assistant is very busy right now. Please try again in a few moments."`

### Rank 2: Deployed GitHub Backend Lacks Civic Grounding & Greeting Handlers
* **Evidence:** The deployed commit on GitHub `origin/main` has an older version of `backend/app/services/ai_router.py` without greeting/gratitude short-circuits. Questions search `constitution_topics` which is currently unpopulated on the database.
* **Consequence:** Without published records in the database table and without local grounding fallback, queries either search empty tables or trigger the failing LLM chain.

### Rank 3: Render Free Tier Cold Starts
* **Evidence:** Free Render Web Services spin down to sleep after 15 minutes of inactivity. First byte on cold wake takes 45–60 seconds. The frontend's standard fetch timeout of 15 seconds aborts before Render finishes waking up.

---

## 3. Ranked Root Causes: Login Failure

### Rank 1: Cross-Origin Cookie Blocking (`pages.dev` vs `onrender.com`) (Primary Cause)
* **Evidence:** 
  * The frontend is hosted at `https://samvidhan-law.pages.dev`
  * The backend API is hosted at `https://samvidhan-law.onrender.com`
  * The backend sets session cookies with `SameSite=lax; HttpOnly; Secure`.
* **Consequence:** Because `pages.dev` and `onrender.com` are different registrable domains, modern browsers (Chrome, Safari, Firefox, Edge) treat these as third-party cross-site cookies. When the frontend later requests `GET /api/auth/me`, the browser refuses to attach the cookie, returning **401 Unauthorized**. The user appears immediately logged out upon page refresh.

### Rank 2: `verify-otp` Token Type and Case Sensitivity Mismatch
* **Evidence:** In `backend/app/supabase_client.py`:
  * Payload hardcodes `"type": "signup"`. For users confirming an email update, existing user recovery, or depending on GoTrue template settings, GoTrue requires `"type": "email"`.
  * Email string is not trimmed or lowercased. Mobile keyboards auto-capitalize the first character of emails, leading to mismatched lookups in GoTrue.

### Rank 3: `resend-otp` is a Dummy Endpoint
* **Evidence:** In `backend/app/routers/auth.py` lines 75–78:
  ```python
  @router.post("/resend-otp")
  async def resend_otp(payload: ResendOtpRequest):
      return {"success": True, "message": "Verification code resent if account exists."}
  ```
  It returns a success JSON but **never calls Supabase GoTrue** to dispatch an email. Users clicking "Resend Code" never receive anything.

### Rank 4: Supabase Built-In Email Rate Limits
* **Evidence:** The default Supabase built-in SMTP sender is strictly capped at ~2 emails per hour per project. When exceeded during manual testing, GoTrue returns `HTTP 429: Email rate limit exceeded`.

---

## 4. Chatbot Current Behavior Matrix

| Scenario | Deployed Backend Behavior | HTTP Status | User Message Shown |
| :--- | :--- | :--- | :--- |
| **Greeting / Thanks** ("Hello", "Thanks") | Sent to LLM pipeline (no local fast-path) | 200 | `"Our AI assistant is very busy right now..."` |
| **No Published Source in DB** | Searches empty table; invokes failing LLM | 200 | `"Our AI assistant is very busy right now..."` |
| **Published Source Found + All Providers Fail** | Failover loop exhausted | 200 | `"Our AI assistant is very busy right now..."` |
| **Quota Exceeded** | `check_and_get_quota` triggers | 429 | `{"detail": "Daily AI question limit reached."}` with `Retry-After: 60` |
| **Backend Asleep (Cold Start)** | Render spins up container (40–60s) | Timeout / 504 | Frontend aborts after 15s with "Connection lost" |

---

## 5. Deployed Commit vs Local Commit Difference

| Feature | Deployed Commit (`origin/main`) | Local `main` (Unpushed) |
| :--- | :--- | :--- |
| **Chatbot Grounding** | Queries `constitution_topics` | Includes `CIVIC_KNOWLEDGE_BASE` and Greeting regex |
| **Groq Model Config** | Obsolete `llama-3.3-70b-versatile` | `qwen/qwen3.8-27b` in commit `babd980` |
| **Gemini Model Config** | `gemini-2.0-flash` (404) | `gemini-2.0-flash` (404) |
| **Cloudflare Forwarder** | Not implemented (direct cross-origin fetch) | Not implemented |
| **`resend-otp`** | Dummy no-op (never contacts GoTrue) | Dummy no-op |

---

## 6. Supabase Dashboard Verification Guide (For the Owner)

Please verify the following settings in your [Supabase Dashboard](https://supabase.com/dashboard):
1. **Authentication -> URL Configuration**:
   * **Site URL:** Should be `https://samvidhan-law.pages.dev`
   * **Redirect URLs:** Must include `https://samvidhan-law.pages.dev/**` and `http://localhost:5173/**`
2. **Authentication -> Email Templates -> "Confirm signup"**:
   * Ensure the body contains `{{ .Token }}` (the 6-digit code), not just `{{ .ConfirmationURL }}`.
3. **Authentication -> Rate Limits**:
   * Check **Email rate limit** (default is 2 per hour on built-in SMTP).
4. **Project Settings -> Authentication -> SMTP Settings**:
   * If using free built-in SMTP, restrict test signups to 1-2 per hour, or connect a free Resend/SendGrid SMTP key.
