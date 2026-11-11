/**
 * Domain whitelist and URL validator for official Indian legal and legislative sources.
 */

export const OFFICIAL_SOURCE_DOMAINS = ['gov.in', 'nic.in', 'sansad.in'] as const

/**
 * Validates whether a given URL points strictly to an approved official source domain
 * using HTTPS, without embedded user credentials or domain spoofing.
 */
export function isOfficialSourceUrl(url: string): boolean {
  if (typeof url !== 'string' || !url.trim()) {
    return false
  }

  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') {
      return false
    }

    if (parsed.username || parsed.password) {
      return false
    }

    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '')

    return OFFICIAL_SOURCE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}
