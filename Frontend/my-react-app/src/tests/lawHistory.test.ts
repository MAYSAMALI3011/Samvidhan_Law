import test from 'node:test'
import assert from 'node:assert/strict'
import type { LawHistory, LawHistoryEntry } from '../types/index.ts'
import {
  formatLawDate,
  sortEntriesNewestFirst,
  summarizeHistory,
  visibleEntries,
} from '../utils/lawHistory.ts'

const sampleEntry1: LawHistoryEntry = {
  id: 'hist-1',
  kind: 'original',
  effectiveDate: '1950-01-26',
  whatChanged: 'Sample original text',
  reason: 'Enactment of Constitution',
  changedBy: 'Constituent Assembly',
  authority: 'Constitution of India',
  sourceLabel: 'Legislative Dept',
  sourceUrl: 'https://legislative.gov.in/act',
  verifiedOn: '2026-01-01',
}

const sampleEntry2: LawHistoryEntry = {
  id: 'hist-2',
  kind: 'amended',
  effectiveDate: '1978-06-20',
  whatChanged: 'Sample amendment text',
  reason: '44th Amendment Act',
  changedBy: 'Parliament of India',
  authority: 'Constitution (Forty-fourth Amendment) Act, 1978',
  sourceLabel: 'Legislative Dept',
  sourceUrl: 'https://legislative.gov.in/act-44',
  verifiedOn: '2026-01-01',
}

const sampleEntry3: LawHistoryEntry = {
  id: 'hist-3',
  kind: 'proposed',
  effectiveDate: '2025',
  whatChanged: 'Sample proposed amendment',
  reason: 'Proposed bill for reform',
  changedBy: 'Parliament Committee',
  authority: 'Bill No. 12 of 2025',
  sourceLabel: 'Sansad Portal',
  sourceUrl: 'https://sansad.in/bill',
  verifiedOn: '2026-01-01',
  isSample: true,
}

test('formatLawDate: formats YYYY, YYYY-MM, and YYYY-MM-DD correctly', () => {
  assert.equal(formatLawDate('1978'), '1978')
  assert.equal(formatLawDate('1978-12'), 'December 1978')
  assert.equal(formatLawDate('1978-12-01'), '1 December 1978')
  assert.equal(formatLawDate('2023-01-26'), '26 January 2023')
  assert.equal(formatLawDate('invalid-date'), 'invalid-date')
  assert.equal(formatLawDate(''), '')
})

test('sortEntriesNewestFirst: sorts entries descending by effectiveDate', () => {
  const sorted = sortEntriesNewestFirst([sampleEntry1, sampleEntry3, sampleEntry2])
  assert.equal(sorted[0].id, 'hist-3') // 2025
  assert.equal(sorted[1].id, 'hist-2') // 1978-06-20
  assert.equal(sorted[2].id, 'hist-1') // 1950-01-26
})

test('summarizeHistory: generates correct chip summary based on enacted amendments', () => {
  const originalOnly: LawHistory = {
    currentStatus: 'in_force',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry1],
  }
  assert.equal(summarizeHistory(originalOnly), 'In force as originally enacted')

  const singleAmendment: LawHistory = {
    currentStatus: 'in_force',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry1, sampleEntry2],
  }
  assert.equal(summarizeHistory(singleAmendment), 'Amended 1 time')

  const multipleAmendments: LawHistory = {
    currentStatus: 'in_force',
    lastVerifiedOn: '2026-01-01',
    entries: [
      sampleEntry1,
      sampleEntry2,
      { ...sampleEntry2, id: 'hist-4', effectiveDate: '2002-12-12', kind: 'inserted' },
    ],
  }
  assert.equal(summarizeHistory(multipleAmendments), 'Amended 2 times')

  const proposedDoesNotCount: LawHistory = {
    currentStatus: 'in_force',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry1, sampleEntry3], // entry3 is 'proposed'
  }
  assert.equal(summarizeHistory(proposedDoesNotCount), 'In force as originally enacted')

  const repealed: LawHistory = {
    currentStatus: 'repealed',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry1, sampleEntry2],
  }
  assert.equal(summarizeHistory(repealed), 'Repealed')

  const proposedStatus: LawHistory = {
    currentStatus: 'proposed',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry3],
  }
  assert.equal(summarizeHistory(proposedStatus), 'Proposed')
})

test('visibleEntries: strips sample entries in production, preserves in dev', () => {
  const history: LawHistory = {
    currentStatus: 'in_force',
    lastVerifiedOn: '2026-01-01',
    entries: [sampleEntry1, sampleEntry2, sampleEntry3],
  }

  const prodEntries = visibleEntries(history, true)
  assert.equal(prodEntries.length, 2)
  assert.equal(prodEntries.some((e) => e.isSample), false)

  const devEntries = visibleEntries(history, false)
  assert.equal(devEntries.length, 3)
  assert.equal(devEntries.some((e) => e.isSample), true)

  assert.deepEqual(visibleEntries(undefined), [])
})
