import type { LawHistory, LawHistoryEntry } from '../types/index.ts'

/**
 * Stable sort entries by effective date descending (newest first).
 */
export function sortEntriesNewestFirst(entries: LawHistoryEntry[]): LawHistoryEntry[] {
  return [...entries].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
}

/**
 * Format ISO dates (YYYY, YYYY-MM, or YYYY-MM-DD) for Indian legal presentation.
 * Returns human-readable strings using en-IN locale in UTC.
 */
export function formatLawDate(iso: string): string {
  if (!iso || typeof iso !== 'string') {
    return ''
  }

  // YYYY
  if (/^\d{4}$/.test(iso)) {
    return iso
  }

  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(iso)) {
    const [year, month] = iso.split('-').map(Number)
    if (month >= 1 && month <= 12) {
      const date = new Date(Date.UTC(year, month - 1, 1))
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric',
      }).format(date)
    }
    return iso
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-').map(Number)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day))
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    }
    return iso
  }

  return iso
}

/**
 * Generates summary chip label for a law's amendment history.
 * Enacted modifications count 'amended', 'inserted', 'omitted', 'replaced'.
 * 'proposed' entries do not count toward enacted amendments.
 */
export function summarizeHistory(history: LawHistory): string {
  const enactedCount = history.entries.filter((entry) =>
    ['amended', 'inserted', 'omitted', 'replaced'].includes(entry.kind),
  ).length

  if (history.currentStatus === 'repealed') {
    return 'Repealed'
  }

  if (history.currentStatus === 'replaced') {
    return 'Replaced'
  }

  if (history.currentStatus === 'proposed') {
    return 'Proposed'
  }

  if (enactedCount === 0) {
    return 'In force as originally enacted'
  }

  return enactedCount === 1 ? 'Amended 1 time' : `Amended ${enactedCount} times`
}

/**
 * Filter entries according to environment.
 * Strips sample entries in production mode.
 */
export function visibleEntries(
  history: LawHistory | undefined,
  isProd: boolean = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD),
): LawHistoryEntry[] {
  if (!history || !Array.isArray(history.entries)) {
    return []
  }

  if (isProd) {
    return history.entries.filter((entry) => !entry.isSample)
  }

  return history.entries
}
