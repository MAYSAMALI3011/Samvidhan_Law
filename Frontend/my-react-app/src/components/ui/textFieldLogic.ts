export function scorePassword(p: string | null | undefined): number {
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p) && p.length >= 10) s++
  if (/^(password|12345678|qwerty)/i.test(p)) s = Math.min(s, 1)
  return Math.max(p.length ? 1 : 0, Math.min(s, 4))
}

const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com']

export const emailSuggestion = (t: string | null | undefined): string => {
  if (!t || typeof t !== 'string') return ''
  const at = t.indexOf('@')
  if (at < 1) return ''
  const rest = t.slice(at + 1)
  const hit = DOMAINS.find((d) => d.startsWith(rest) && d !== rest)
  return hit ? t.slice(0, at + 1) + hit : ''
}
