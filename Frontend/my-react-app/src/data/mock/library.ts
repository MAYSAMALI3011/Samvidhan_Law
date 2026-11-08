import type { LibraryDocument } from '../../types'

export const libraryDocuments: LibraryDocument[] = [
  {
    id: 'sample-constitution-guide',
    title: 'How to read a constitutional article (study guide)',
    category: 'Study guides',
    summary: 'A method for Part, article, explanation, and official-text verification.',
    updatedLabel: 'Sample · November 2026',
    sourceLabel: 'Samvidhan educational sample — not an official publication',
    isSample: true,
    tags: ['constitution', 'method'],
    body: [
      'This document is a sample study guide created for the Samvidhan frontend. It is not gazetted law.',
      'Step 1: Note the Part and article number. Step 2: Read who the article addresses. Step 3: Read neighbouring clauses and any stated restrictions. Step 4: Open an official text to confirm wording and date.',
      'Do not cite this page in academic or legal work as if it were the Constitution.',
    ],
  },
  {
    id: 'sample-consumer-checklist',
    title: 'Consumer complaint checklist (awareness)',
    category: 'Practical guides',
    summary: 'Bills, defect description, seller channel, then official consumer process.',
    updatedLabel: 'Sample · November 2026',
    sourceLabel: 'Samvidhan educational sample — verify against current consumer law',
    isSample: true,
    tags: ['consumer', 'checklist'],
    body: [
      'Keep the invoice, screenshots, and a short timeline. Write what was promised and what was delivered.',
      'Use the business grievance channel first when it is safe and available. If you escalate, use the process described in current official consumer-protection materials.',
      'This checklist does not file a case and does not guarantee a refund.',
    ],
  },
  {
    id: 'sample-cyber-reporting',
    title: 'Cyber fraud first hour (awareness)',
    category: 'Digital safety',
    summary: 'Educational sequence for suspected online financial fraud.',
    updatedLabel: 'Sample · November 2026',
    sourceLabel: 'Samvidhan educational sample — confirm official portal URLs independently',
    isSample: true,
    tags: ['cyber', 'fraud'],
    body: [
      'If money may have moved, call your bank’s official fraud number from a number you already trust — not a number in the suspicious message.',
      'Preserve SMS, call logs, and URLs. Avoid forwarding malicious links.',
      'Use the National Cyber Crime reporting channels published on official government domains. This sample page does not host a report form.',
    ],
  },
  {
    id: 'sample-workplace-map',
    title: 'Workplace issue map (awareness)',
    category: 'Practical guides',
    summary: 'Separate wage, safety, discrimination, and harassment questions.',
    updatedLabel: 'Sample · November 2026',
    sourceLabel: 'Samvidhan educational sample — not an HR or legal opinion',
    isSample: true,
    tags: ['employment', 'map'],
    body: [
      'Name the facts: contract or wage slip, dates, people involved, and what you want to happen next (safety, unpaid dues, an internal complaint).',
      'Internal committees, labour authorities, and police address different problems. This map only helps you ask a clearer question.',
    ],
  },
  {
    id: 'sample-sources-policy',
    title: 'How Samvidhan will treat legal sources (future RAG)',
    category: 'Product',
    summary: 'Frontend contract for source, section, date, and uncertainty.',
    updatedLabel: 'Sample · November 2026',
    sourceLabel: 'Product note for the frontend milestone',
    isSample: true,
    tags: ['product', 'rag-ready'],
    body: [
      'Future answers should display: source title, relevant section or article, publication or update date, retrieval reference, and a limitations line.',
      'Until a verified knowledge base exists, the Ask interface uses labelled mock replies and must not invent case citations.',
    ],
  },
]

export const libraryCategories = [
  'All',
  'Study guides',
  'Practical guides',
  'Digital safety',
  'Product',
]
