import type { ConstitutionTopic } from '../../types'

export const constitutionTopics: ConstitutionTopic[] = [
  {
    id: 'preamble',
    title: 'Preamble',
    part: 'Front matter',
    summary: 'Values and source of authority that orient constitutional reading.',
    sections: [
      {
        heading: 'What learners should notice',
        body: 'The Preamble names justice, liberty, equality, and fraternity. Use it as a reading key. Confirm the current official wording, including later insertions, from an authorised text.',
      },
      {
        heading: 'Source note',
        body: 'This page is sample educational copy for the Samvidhan frontend. It is not an official reproduction of the Constitution.',
      },
    ],
    relatedLessonIds: ['cf-preamble'],
    sourceNote: 'Sample study note. Verify against the official Constitution of India text.',
  },
  {
    id: 'part-iii',
    title: 'Fundamental Rights',
    part: 'Part III',
    summary: 'Cluster of rights and constitutional remedies.',
    sections: [
      {
        heading: 'Study map',
        body: 'Part III is typically taught as a group: equality, freedoms, protection of life and personal liberty, and remedies. Restrictions and exceptions sit in the text itself.',
      },
      {
        heading: 'How to continue',
        body: 'Open the Fundamental Rights course for sequenced lessons, then return here for a slower read.',
      },
    ],
    relatedLessonIds: ['fr-overview', 'fr-equality', 'fr-liberty'],
    sourceNote: 'Sample study note. Not a substitute for Part III of the official text.',
  },
  {
    id: 'part-iv',
    title: 'Directive Principles of State Policy',
    part: 'Part IV',
    summary: 'Principles that guide the State, taught as distinct from directly enforceable fundamental rights.',
    sections: [
      {
        heading: 'Learning distinction',
        body: 'DPSP are often introduced as directions to the State rather than the same kind of individually enforceable rights found in Part III. Classroom shorthand can oversimplify — read the articles.',
      },
    ],
    relatedLessonIds: ['cf-parts'],
    sourceNote: 'Sample study note for orientation only.',
  },
  {
    id: 'duties',
    title: 'Fundamental Duties',
    part: 'Part IVA',
    summary: 'Duties associated with citizenship, taught alongside rights.',
    sections: [
      {
        heading: 'Study posture',
        body: 'Duties are part of constitutional literacy. This page lists the idea, not a penalty schedule. Check the current article text for the official list.',
      },
    ],
    relatedLessonIds: ['cf-parts'],
    sourceNote: 'Sample study note. Confirm the official list of duties.',
  },
  {
    id: 'union-parliament',
    title: 'Union Parliament',
    part: 'Part V',
    summary: 'The Union legislature in the constitutional design.',
    sections: [
      {
        heading: 'Why it matters for learners',
        body: 'Following how a bill becomes law reduces confusion between a proposal, a notification, and an Act in force.',
      },
    ],
    relatedLessonIds: ['cf-parliament'],
    sourceNote: 'Sample institutional overview. See official Parliament of India resources for procedure.',
  },
  {
    id: 'judiciary',
    title: 'The Union judiciary',
    part: 'Part V',
    summary: 'Constitutional courts and the idea of independent interpretation.',
    sections: [
      {
        heading: 'Remedies',
        body: 'Writ jurisdiction is a core teaching point. Procedure, limitation, and strategy are outside this educational page.',
      },
    ],
    relatedLessonIds: ['cf-courts'],
    sourceNote: 'Sample study note. Not court filing guidance.',
  },
]
