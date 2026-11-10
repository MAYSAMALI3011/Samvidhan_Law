/**
 * Validates and sanitizes return redirect URLs to prevent Open Redirect attacks.
 * Rejects protocol-relative URLs (//evil.com), scheme overrides (javascript:, https:),
 * and backslash obfuscation (/\evil.com, /\/evil.com).
 */
export function sanitizeReturnUrl(url: string | null | undefined, fallback = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback
  const trimmed = url.trim()

  // Must start with exactly one '/' and contain no protocol (scheme), backslashes, or double-slashes
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes(':') &&
    !trimmed.includes('\\')
  ) {
    return trimmed
  }

  return fallback
}

const ALLOWED_CHECKOUT_HOSTS = ['checkout.stripe.com', 'api.razorpay.com']

/**
 * Validates checkout URLs returned by the subscription API.
 * Ensures the destination is either a same-origin relative path or an approved payment gateway.
 */
export function isValidCheckoutUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const parsed = new URL(trimmed, origin)

    // Same-origin paths are safe
    if (parsed.origin === origin) {
      return true
    }

    // External payment gateways must strictly use HTTPS and match approved hosts
    if (parsed.protocol !== 'https:') {
      return false
    }

    return ALLOWED_CHECKOUT_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}
