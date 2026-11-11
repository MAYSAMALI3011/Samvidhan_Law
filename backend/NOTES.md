# Samvidhan Backend Implementation Notes

## Part A - Phase 1

### Assumptions
1. **Frontend Contract Conformance**:
   - Error shape strictly adheres to `{ success: false, message: "...", errors: ... }`.
   - `/api/auth/me` returns the `UserProfile` object directly (unwrapped).
   - Rate limiting and quota checks run before any AI provider streaming starts, returning HTTP 429 with `Retry-After`.
2. **Multi-Provider Fallback**:
   - Fallback router handles Gemini, Groq, Mistral, and OpenRouter in configurable priority.
   - Failover is strictly restricted to before the first token is sent to the client. Mid-stream failures emit `event: error` followed by `event: done`.
   - If no provider keys are set or all providers fail, the router safely streams `AI_DEFAULT_ANSWER` without throwing 500 errors.
3. **Database & Supabase Auth**:
   - The backend operates with Row Level Security enabled across all tables with no public policies, accessing data securely via the `service_role` key.
   - Authentication tokens are validated using GoTrue's `/auth/v1/user` endpoint and cached for 30 seconds.

### Frontend Disagreements & Observations (For Owner Reference)
1. **`useChatStream.ts` Conversation ID Tracking**:
   - The frontend historically did not pass `conversationId` back on follow-up queries. Phase 1 backend generates and returns `conversationId` in the `done` event payload so future queries can link conversation history.
2. **Cross-Site Cookies on GitHub Pages**:
   - GitHub Pages (`github.io`) and backend hosts (`onrender.com`) are cross-site. In production, this requires `SameSite=None; Secure`. If third-party cookies are blocked by certain browser privacy settings, users can enable the Bearer token strategy (`VITE_AUTH_STRATEGY=bearer`).
