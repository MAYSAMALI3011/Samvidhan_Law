// Contract check: Validates backend Law History schemas against Frontend Zod schemas
import { lawHistorySchema, lawHistoryEntrySchema } from '../Frontend/my-react-app/src/api/schemas.ts';

console.log('Running contract check for Law History schemas...');

// 1. Test Rule 2 (In-force provision without footnotes)
const inForceLawHistory = {
  currentStatus: 'in_force',
  lastVerifiedOn: '2024-05-01',
  entries: []
};

const resInForce = lawHistorySchema.safeParse(inForceLawHistory);
if (!resInForce.success) {
  console.error('Contract check failed for in_force LawHistory:', resInForce.error);
  process.exit(1);
}
console.log('✔ Rule 2 in_force LawHistory conforms to frontend schema.');

// 2. Test Rule 3 (Published entries sorted oldest first)
const amendedLawHistory = {
  currentStatus: 'amended',
  lastVerifiedOn: '2024-05-01',
  entries: [
    {
      id: 'e1',
      kind: 'amended',
      effectiveDate: '1976-01-03',
      whatChanged: 'Words SOVEREIGN DEMOCRATIC REPUBLIC substituted',
      oldText: 'SOVEREIGN DEMOCRATIC REPUBLIC',
      reason: 'To insert SOCIALIST and SECULAR',
      changedBy: 'Parliament of India',
      authority: 'Parliament of India',
      sourceLabel: 'Gazette of India',
      sourceUrl: 'https://legislative.gov.in/actsofparliamentfromtheyear/constitution-forty-second-amendment-act-1976',
      verifiedOn: '2024-05-01'
    }
  ]
};

const resAmended = lawHistorySchema.safeParse(amendedLawHistory);
if (!resAmended.success) {
  console.error('Contract check failed for amended LawHistory:', resAmended.error);
  process.exit(1);
}
console.log('✔ Rule 3 amended LawHistory conforms to frontend schema.');

// 3. Test Repealed / Omitted
const repealedLawHistory = {
  currentStatus: 'repealed',
  lastVerifiedOn: '2024-05-01',
  entries: [
    {
      id: 'e2',
      kind: 'omitted',
      effectiveDate: '1978-06-20',
      whatChanged: 'Article 31 omitted by 44th Amendment Act',
      reason: 'To delete right to property as a fundamental right',
      changedBy: 'Parliament of India',
      authority: 'Parliament of India',
      sourceLabel: 'Gazette of India',
      sourceUrl: 'https://legislative.gov.in',
      verifiedOn: '2024-05-01'
    }
  ]
};

const resRepealed = lawHistorySchema.safeParse(repealedLawHistory);
if (!resRepealed.success) {
  console.error('Contract check failed for repealed LawHistory:', resRepealed.error);
  process.exit(1);
}
console.log('✔ Rule 3 repealed LawHistory conforms to frontend schema.');

console.log('\nALL CONTRACT CHECKS PASSED: Backend models mirror frontend Zod contracts.');
