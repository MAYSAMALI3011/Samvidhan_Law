import type { LawHistory } from '../../types/index.ts'

/**
 * FAKE SAMPLE FIXTURE FOR TESTING AND DEVELOPMENT ONLY.
 *
 * ABSOLUTE CONTENT RULE:
 * This file contains strictly synthetic placeholder text. No real legal history,
 * real article text, real amendment numbers, real dates, or real official names
 * are fabricated here. Real, verified legal history will be authored separately.
 */
export const devSampleLawHistory: LawHistory = {
  currentStatus: 'in_force',
  lastVerifiedOn: '2026-04-01',
  entries: [
    {
      id: 'dev-sample-entry-3',
      kind: 'proposed',
      effectiveDate: '2025-11',
      whatChanged: 'SAMPLE PROPOSED BILL: This is a placeholder proposed modification to test layout rendering.',
      oldText: 'SAMPLE CLAUSE: The previous statutory wording as placeholder text.',
      newText: 'SAMPLE CLAUSE: The proposed replacement statutory wording as placeholder text.',
      reason: 'SAMPLE REASON: Reform proposal for developmental test purposes.',
      reasonSource: 'SAMPLE SOURCE: Parliamentary Standing Committee Report No. 00',
      changedBy: 'SAMPLE AUTHORITY: Parliamentary Drafting Committee',
      authority: 'SAMPLE BILL: The Sample Law Reform (Amendment) Bill, 2025',
      sourceLabel: 'Sansad Legislative Archive (Sample)',
      sourceUrl: 'https://sansad.in/sample-bill-record',
      verifiedOn: '2026-04-01',
      isSample: true,
    },
    {
      id: 'dev-sample-entry-2',
      kind: 'amended',
      effectiveDate: '1978-06-20',
      whatChanged: 'SAMPLE AMENDMENT: Substituted placeholder phrase with updated statutory wording.',
      oldText: 'SAMPLE CLAUSE: Every citizen shall have the placeholder entitlement subject to condition X.',
      newText: 'SAMPLE CLAUSE: Every citizen shall have the expanded placeholder entitlement subject to constitutional safeguards.',
      reason: 'SAMPLE REASON: To clarify the scope of procedural protections according to layout guidelines.',
      reasonSource: 'SAMPLE SOURCE: Statement of Objects and Reasons (Sample Act)',
      changedBy: 'Parliament of India (Sample)',
      authority: 'SAMPLE ACT: The Constitution (Sample Amendment) Act',
      sourceLabel: 'Legislative Department Gazette (Sample)',
      sourceUrl: 'https://legislative.gov.in/sample-gazette-entry',
      verifiedOn: '2026-04-01',
      isSample: true,
    },
    {
      id: 'dev-sample-entry-1',
      kind: 'original',
      effectiveDate: '1950-01-26',
      whatChanged: 'SAMPLE ORIGINAL: Original text as enacted at the commencement of the Constitution.',
      newText: 'SAMPLE CLAUSE: Original placeholder statutory text as enacted.',
      reason: 'SAMPLE REASON: Founding enactment of the constitutional provision.',
      reasonSource: 'SAMPLE SOURCE: Constituent Assembly Debates (Sample Archive)',
      changedBy: 'Constituent Assembly of India (Sample)',
      authority: 'Constitution of India (Sample Archive)',
      sourceLabel: 'National Portal of India (Sample)',
      sourceUrl: 'https://gov.in/sample-constitution-archive',
      verifiedOn: '2026-04-01',
      isSample: true,
    },
  ],
}

export const devOriginalOnlyLawHistory: LawHistory = {
  currentStatus: 'in_force',
  lastVerifiedOn: '2026-04-01',
  entries: [],
}
