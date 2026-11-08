/**
 * Resolves static public asset URLs with Vite's configured base path.
 * Ensures assets load correctly on both root domain (localhost / custom domain)
 * and subpath hosting (GitHub Pages, e.g. /Samvidhan_Law/).
 */
export function assetUrl(path: string): string {
  if (!path) return ''
  // If already absolute URL or data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `${cleanBase}${cleanPath}`
}

/**
 * Resolves comma-separated srcSet strings with the base URL.
 * e.g. "/assets/icon.png 60w, /assets/icon2x.png 120w"
 */
export function resolveSrcSet(srcSet: string): string {
  if (!srcSet) return ''
  return srcSet
    .split(',')
    .map((part) => {
      const trimmed = part.trim()
      const spaceIdx = trimmed.lastIndexOf(' ')
      if (spaceIdx === -1) {
        return assetUrl(trimmed)
      }
      const url = trimmed.slice(0, spaceIdx)
      const descriptor = trimmed.slice(spaceIdx)
      return `${assetUrl(url)}${descriptor}`
    })
    .join(', ')
}
