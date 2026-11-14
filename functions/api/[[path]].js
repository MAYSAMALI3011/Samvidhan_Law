/**
 * Cloudflare Pages Function: Reverse Proxy for /api/* to Render backend.
 * Enables same-origin session cookies and unbuffered SSE streaming without a custom domain.
 */

// Hop-by-hop headers according to RFC 2616 Section 13.5.1 and Cloudflare edge specific headers
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-visitor',
  'cdn-loop',
  'x-real-ip',
]);

export async function onRequest(context) {
  const { request, env } = context;

  // Render backend target URL
  const backendBaseUrl = (env.BACKEND_URL || 'https://samvidhan-law.onrender.com').replace(/\/+$/, '');
  const reqUrl = new URL(request.url);

  // Target path and query string: /api/...
  const targetUrl = new URL(reqUrl.pathname + reqUrl.search, backendBaseUrl);

  // Filter and forward headers
  const forwardHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) {
      continue;
    }
    // Host header must match target backend
    if (lowerKey === 'host') {
      continue;
    }
    forwardHeaders.set(key, value);
  }

  // Set target host header
  forwardHeaders.set('host', targetUrl.host);

  // Preserve X-Forwarded headers for backend origin and protocol awareness
  forwardHeaders.set('x-forwarded-host', reqUrl.host);
  forwardHeaders.set('x-forwarded-proto', reqUrl.protocol.replace(':', ''));

  // Body handling: GET/HEAD methods must not send a body
  const method = request.method.toUpperCase();
  const isBodyAllowed = !['GET', 'HEAD'].includes(method);
  const body = isBodyAllowed ? request.body : null;

  try {
    const backendResponse = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });

    // Copy backend response headers
    const responseHeaders = new Headers();

    // Preserve multiple Set-Cookie headers using getSetCookie() if available
    if (typeof backendResponse.headers.getSetCookie === 'function') {
      const setCookies = backendResponse.headers.getSetCookie();
      for (const cookie of setCookies) {
        responseHeaders.append('set-cookie', cookie);
      }
    }

    for (const [key, value] of backendResponse.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lowerKey)) {
        continue;
      }
      if (lowerKey === 'set-cookie' && typeof backendResponse.headers.getSetCookie === 'function') {
        // Already handled to avoid comma-delimited merging
        continue;
      }
      responseHeaders.set(key, value);
    }

    // Configure unbuffered streaming for Server-Sent Events
    const contentType = responseHeaders.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      responseHeaders.set('cache-control', 'no-cache, no-transform');
      responseHeaders.set('x-accel-buffering', 'no');
    }

    // Return backend body stream unbuffered
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        detail: 'The backend service is currently unreachable. Please try again shortly.',
        error: String(err?.message || err),
      }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }
}
