import type { Course, Lesson, Quiz } from '../../types'

export const courses: Course[] = [
  {
    id: 'constitution-foundations',
    title: 'Constitution Foundations',
    tagline: 'How India’s Constitution is organised',
    description:
      'A structured introduction to the Constitution of India: its purpose, structure, and the institutions that give it effect. Sample educational content for the Samvidhan frontend milestone.',
    level: 'Foundation',
    category: 'Constitution',
    estimatedHours: 3,
    lessonCount: 4,
    chapters: [
      { id: 'cf-1', title: 'Origins and structure', lessonIds: ['cf-preamble', 'cf-parts'] },
      { id: 'cf-2', title: 'Institutions', lessonIds: ['cf-parliament', 'cf-courts'] },
    ],
  },
  {
    id: 'fundamental-rights',
    title: 'Fundamental Rights',
    tagline: 'Rights, limits, and constitutional remedies',
    description:
      'Learn the architecture of Part III, how rights are balanced with reasonable restrictions, and why remedies matter. Sample educational content — not legal advice.',
    level: 'Core',
    category: 'Constitution',
    estimatedHours: 3,
    lessonCount: 3,
    chapters: [
      { id: 'fr-1', title: 'The rights framework', lessonIds: ['fr-overview', 'fr-equality', 'fr-liberty'] },
    ],
  },
  {
    id: 'everyday-law',
    title: 'Everyday Legal Knowledge',
    tagline: 'Practical situations, explained simply',
    description:
      'Consumer protection, workplace basics, and student-relevant situations in one curriculum. Recommendations may follow your progress — they do not create a separate path.',
    level: 'Applied',
    category: 'Practical law',
    estimatedHours: 4,
    lessonCount: 4,
    chapters: [
      { id: 'el-1', title: 'Markets and work', lessonIds: ['el-consumer', 'el-work'] },
      { id: 'el-2', title: 'Campus and civic life', lessonIds: ['el-student', 'el-complaint'] },
    ],
  },
  {
    id: 'digital-privacy',
    title: 'Cybercrime and Digital Privacy',
    tagline: 'Safer digital citizenship',
    description:
      'Educational overview of online offences, reporting channels, and privacy hygiene. Sample content for demonstration only.',
    level: 'Applied',
    category: 'Digital law',
    estimatedHours: 2,
    lessonCount: 2,
    chapters: [
      { id: 'dp-1', title: 'Online harm and reporting', lessonIds: ['dp-offences', 'dp-privacy'] },
    ],
  },
]

export const lessons: Lesson[] = [
  {
    id: 'cf-preamble',
    courseId: 'constitution-foundations',
    chapterId: 'cf-1',
    title: 'The Preamble as a key to reading the Constitution',
    durationMinutes: 14,
    summary: 'What the Preamble states, and how learners can use it as a map rather than a slogan.',
    content: [
      'The Preamble records the source of constitutional authority — “We, the people of India” — and names justice, liberty, equality, and fraternity as guiding values.',
      'For learning purposes, treat the Preamble as a compass: it helps you notice when a later provision is about fairness of process, personal freedom, equal treatment, or social solidarity.',
      'This lesson is educational. Exact wording and later amendments should be checked against an official, current text of the Constitution.',
    ],
    example:
      'When you read a provision about equality before the law, return to the Preamble’s promise of equality of status and opportunity. The Preamble does not replace the article; it orients your reading.',
    takeaways: [
      'The Preamble identifies values, not a stand-alone list of enforceable rules for this lesson.',
      'Official, dated constitutional text remains the reference for wording.',
    ],
    quizId: 'quiz-cf-preamble',
  },
  {
    id: 'cf-parts',
    courseId: 'constitution-foundations',
    chapterId: 'cf-1',
    title: 'Parts, schedules, and how to navigate the text',
    durationMinutes: 16,
    summary: 'A practical map of Parts, Articles, and Schedules so later lessons stay locatable.',
    content: [
      'The Constitution is organised into Parts covering the Union, States, fundamental rights, directive principles, and more. Schedules collect lists and details that the main articles refer to.',
      'A useful study habit is to note the Part and article number before memorising a paraphrase. That habit makes later library reading and Ask Samvidhan answers easier to verify.',
      'Samvidhan presents a learning map. It is not an official gazette and may lag behind amendments.',
    ],
    example:
      'If a lesson mentions the Seventh Schedule, look for Union, State, and Concurrent lists rather than treating “schedule” as a generic appendix.',
    takeaways: [
      'Navigate by Part and article, then read the official text.',
      'Schedules are part of the Constitution, not optional extras.',
    ],
  },
  {
    id: 'cf-parliament',
    courseId: 'constitution-foundations',
    chapterId: 'cf-2',
    title: 'Parliament in the constitutional design',
    durationMinutes: 18,
    summary: 'Lok Sabha, Rajya Sabha, and why law-making is a public process.',
    content: [
      'Parliament is the Union legislature. Understanding bills, houses, and the President’s role helps you follow how a proposal becomes law — and why that process is slower than a social-media claim.',
      'This overview does not cover every parliamentary procedure. Standing orders and current practice should be read from official Parliament resources.',
    ],
    example:
      'A consumer-protection amendment is not “the law” because it is discussed online. It becomes binding only after the constitutional law-making process is completed and the text is notified as required.',
    takeaways: [
      'Legislation has a documented path. Viral summaries are not the Act.',
      'Institutional roles (Houses, President) are part of the map, not trivia.',
    ],
  },
  {
    id: 'cf-courts',
    courseId: 'constitution-foundations',
    chapterId: 'cf-2',
    title: 'Constitutional courts and remedies',
    durationMinutes: 15,
    summary: 'Why an independent judiciary sits at the centre of constitutional learning.',
    content: [
      'The Supreme Court and High Courts interpret the Constitution and can protect fundamental rights through constitutional remedies. Learning the idea of a remedy is as important as naming a right.',
      'Case names in later lessons are study labels. They are not a substitute for reading a judgment or taking professional advice.',
    ],
    example:
      'Knowing that a writ exists is not the same as filing one. Educational platforms explain the concept; procedure, limitation, and strategy belong with qualified professionals and official court processes.',
    takeaways: [
      'Rights without remedies are incomplete as a learning topic.',
      'Court procedure is not something this demo can complete for you.',
    ],
    quizId: 'quiz-cf-courts',
  },
  {
    id: 'fr-overview',
    courseId: 'fundamental-rights',
    chapterId: 'fr-1',
    title: 'How Part III is organised',
    durationMinutes: 12,
    summary: 'A map of the Fundamental Rights cluster before close reading of equality and liberty.',
    content: [
      'Part III groups several rights, including equality, freedom, protection of life and personal liberty, and constitutional remedies. Some rights apply to all persons; some apply to citizens. Always check the text.',
      'Reasonable restrictions appear in the Constitution itself. Learning those limits is part of understanding a right, not an attempt to weaken it.',
    ],
    example:
      'A classroom debate about speech is richer when students also read the grounds on which the Constitution itself contemplates restriction, rather than treating “absolute freedom” as the starting point.',
    takeaways: [
      'Read the right and its neighbouring clauses together.',
      'Citizenship versus “person” language matters.',
    ],
    quizId: 'quiz-fr-overview',
  },
  {
    id: 'fr-equality',
    courseId: 'fundamental-rights',
    chapterId: 'fr-1',
    title: 'Equality before law and equal protection',
    durationMinutes: 16,
    summary: 'Articles often summarised as “equality” need careful, paired reading.',
    content: [
      'Equality before the law and equal protection of the laws are related ideas. Educational summaries sometimes collapse them; the constitutional text keeps both in view.',
      'Special provisions permitted by the Constitution are part of the equality conversation, not an afterthought. This lesson flags the idea; it does not settle contemporary policy debates.',
    ],
    example:
      'A public office that applies a rule only to one community without a constitutional basis is a different problem from a measure the Constitution expressly contemplates. Both require the actual text and, for real disputes, professional advice.',
    takeaways: [
      'Equality is a cluster of provisions, not a single slogan.',
      'Sample explanations here are not case holdings.',
    ],
  },
  {
    id: 'fr-liberty',
    courseId: 'fundamental-rights',
    chapterId: 'fr-1',
    title: 'Life, liberty, and due process in study form',
    durationMinutes: 18,
    summary: 'Why Article 21 is taught as a living provision — and why unofficial summaries expire.',
    content: [
      'Protection of life and personal liberty is one of the most taught constitutional ideas in India. Courts have interpreted it over decades. A learning product must therefore show dates and warn that doctrine evolves.',
      'Samvidhan’s frontend milestone uses sample explanations. It does not retrieve the latest reported judgments.',
    ],
    example:
      'A question such as “Can the State restrict movement during an emergency?” cannot be answered from a slogan. It depends on the constitutional text, any valid law, and judicial interpretation at the relevant time.',
    takeaways: [
      'Article 21 is a study gateway, not a complete code of police or hospital practice.',
      'Check current, official sources before relying on any paraphrase.',
    ],
  },
  {
    id: 'el-consumer',
    courseId: 'everyday-law',
    chapterId: 'el-1',
    title: 'Consumer protection in everyday purchases',
    durationMinutes: 15,
    summary: 'Defective goods, deficient services, and where educational next steps usually begin.',
    content: [
      'Consumer law is designed so ordinary buyers can complain about defective goods or deficient services. Forums, limitation periods, and definitions change; always verify the current Consumer Protection Act and rules.',
      'This lesson teaches a method: keep bills, describe the defect, use the seller’s grievance channel, then consider the official consumer process if needed.',
    ],
    example:
      'An online order that never arrives is a common study scenario. The educational next step is documentation and the platform’s complaint path — not a guaranteed refund from Samvidhan.',
    takeaways: [
      'Keep proof of purchase and written complaints.',
      'Educational next steps are not a promise of outcome.',
    ],
    quizId: 'quiz-el-consumer',
  },
  {
    id: 'el-work',
    courseId: 'everyday-law',
    chapterId: 'el-1',
    title: 'Workplace rights as a learning map',
    durationMinutes: 17,
    summary: 'Wages, leave, and harassment frameworks at an awareness level.',
    content: [
      'Employment relationships in India sit across labour codes, older enactments still relevant in some contexts, shop-and-establishment laws, and workplace harassment law. This lesson is a map, not a HR manual.',
      'If you have an active workplace dispute, a qualified professional and the appropriate authority matter more than an educational quiz score.',
    ],
    example:
      'Unpaid wages and a hostile workplace are different legal maps. Mixing them in one complaint without facts can weaken both. Education helps you separate the questions.',
    takeaways: [
      'Name the problem precisely: wage, safety, discrimination, or harassment.',
      'Internal complaints and statutory forums are not the same step.',
    ],
  },
  {
    id: 'el-student',
    courseId: 'everyday-law',
    chapterId: 'el-2',
    title: 'Student life: rules, dignity, and digital harm',
    durationMinutes: 14,
    summary: 'Campus rules, ragging-related awareness, and online bullying as educational topics.',
    content: [
      'Students meet law through university regulations, anti-ragging frameworks, consumer issues (coaching, housing), and cyber offences. This is still the same Samvidhan curriculum — not a separate “student path”.',
      'Institutional grievance cells exist in many colleges. Knowing they exist is awareness; using them correctly depends on the institution’s current rules.',
    ],
    example:
      'A leaked private photograph circulating in a class group is both a dignity issue and potentially a cyber offence. Educational advice: preserve evidence, use campus and platform reporting, and seek trusted adult or professional help. This is not a police complaint filed by the app.',
    takeaways: [
      'Campus, criminal, and consumer maps can overlap.',
      'Preserve evidence; do not inflame the circulation of harmful content.',
    ],
  },
  {
    id: 'el-complaint',
    courseId: 'everyday-law',
    chapterId: 'el-2',
    title: 'Complaints, FIRs, and realistic next steps',
    durationMinutes: 16,
    summary: 'How educational material talks about police complaints without imitating a lawyer.',
    content: [
      'Citizens often hear “file an FIR” as a generic solution. Learning the difference between information to police, a written complaint, and later investigation is part of civic education.',
      'Zero FIR and other procedural ideas are widely discussed in public education campaigns. Confirm current criminal procedure from official sources; this demo does not practise law.',
    ],
    example:
      'A stolen phone may involve a police complaint and a telecom block request. An educational checklist is not a substitute for the station’s current process.',
    takeaways: [
      'Write facts in order: what, when, where, who, what was lost.',
      'Ask for acknowledgement of a written complaint when you use official channels.',
    ],
  },
  {
    id: 'dp-offences',
    courseId: 'digital-privacy',
    chapterId: 'dp-1',
    title: 'Common cyber offences in public awareness',
    durationMinutes: 13,
    summary: 'Impersonation, financial fraud, and abusive communication as study categories.',
    content: [
      'Indian criminal and IT-related law addresses several online harms. Section numbers change with new codes and amendments. This lesson uses categories, not frozen citations, for that reason.',
      'Reporting often involves the National Cyber Crime reporting portal, the bank (for financial fraud), and local police. Verify URLs from official government domains.',
    ],
    example:
      'An OTP shared on a phone call is a classic awareness story. The educational point is prevention and rapid bank reporting — not a guaranteed reversal.',
    takeaways: [
      'Do not share OTPs or remote-access permissions.',
      'Use official reporting channels; ignore look-alike sites.',
    ],
    quizId: 'quiz-dp-offences',
  },
  {
    id: 'dp-privacy',
    courseId: 'digital-privacy',
    chapterId: 'dp-1',
    title: 'Digital Privacy & DPDP Act 2023 Citizen Rights',
    durationMinutes: 12,
    summary: 'Statutory consent rules, 1-tap withdrawal, right to erasure, and online privacy safeguards under India’s Digital Personal Data Protection Act 2023.',
    content: [
      'Under the Digital Personal Data Protection (DPDP) Act 2023, personal data processing requires clear, itemised notice (Sections 5 & 6) and verifiable consent.',
      'A fundamental statutory rule is Consent Parity (Section 6(4)): withdrawing consent for marketing or tracking must be as simple, effortless, and accessible as giving it ("Consent do = Waapas lo").',
      'Citizens possess actionable rights including the Right to Erasure / Data Deletion (Section 12), the right to nominate representatives, and the right to contact a designated Grievance Redressal Officer (Section 8(9)). For children and minors (Section 9), verifiable parental consent is mandatory with a strict statutory bar on behavioural tracking.',
    ],
    example:
      'If an online shopping platform took your consent to receive promotional messages via an easy opt-in checkbox, Section 6(4) of the DPDP Act mandates they provide an equally direct 1-tap mechanism to withdraw that marketing consent at any time without punitive service denial.',
    takeaways: [
      'Under DPDP Section 6(4), withdrawing consent must be as effortless and 1-tap as granting it.',
      'You have the legal right to request complete deletion of your personal data under Section 12.',
      'Every regulated entity must publish the identity and contact details of a Grievance Redressal Officer.',
    ],
  },
]

export const quizzes: Quiz[] = [
  {
    id: 'quiz-cf-preamble',
    courseId: 'constitution-foundations',
    lessonId: 'cf-preamble',
    title: 'Preamble check',
    questions: [
      {
        id: 'q1',
        prompt: 'In this educational map, what is the most accurate role of the Preamble?',
        options: [
          { id: 'a', label: 'A complete enforceable code that replaces later articles' },
          { id: 'b', label: 'A statement of source and values that orients reading of the Constitution' },
          { id: 'c', label: 'A political manifesto with no relationship to the constitutional text' },
        ],
        correctOptionId: 'b',
        explanation:
          'The lesson treats the Preamble as a compass for later provisions, not a substitute for the articles themselves.',
      },
      {
        id: 'q2',
        prompt: 'Why does Samvidhan insist you still check an official constitutional text?',
        options: [
          { id: 'a', label: 'Because educational paraphrases can lag behind amendments' },
          { id: 'b', label: 'Because the Preamble is secret' },
          { id: 'c', label: 'Because quizzes replace the Constitution' },
        ],
        correctOptionId: 'a',
        explanation: 'Unofficial learning products can be outdated. Official, dated text is the reference.',
      },
    ],
  },
  {
    id: 'quiz-cf-courts',
    courseId: 'constitution-foundations',
    lessonId: 'cf-courts',
    title: 'Courts and remedies',
    questions: [
      {
        id: 'q1',
        prompt: 'Why does this course teach remedies alongside rights?',
        options: [
          { id: 'a', label: 'Because naming a right is enough to win a case automatically' },
          { id: 'b', label: 'Because constitutional learning is incomplete without the idea of a remedy' },
          { id: 'c', label: 'Because Samvidhan files writs for users' },
        ],
        correctOptionId: 'b',
        explanation: 'The lesson emphasises that rights and remedies are studied together. The app does not file cases.',
      },
    ],
  },
  {
    id: 'quiz-fr-overview',
    courseId: 'fundamental-rights',
    lessonId: 'fr-overview',
    title: 'Part III orientation',
    questions: [
      {
        id: 'q1',
        prompt: 'What should you check when a lesson says “everyone has this right”?',
        options: [
          { id: 'a', label: 'Whether the constitutional text applies to persons or to citizens' },
          { id: 'b', label: 'Whether the lesson used gold-coloured headings' },
          { id: 'c', label: 'Whether a friend agreed on social media' },
        ],
        correctOptionId: 'a',
        explanation: 'Part III language differs. Always read who the article addresses.',
      },
    ],
  },
  {
    id: 'quiz-el-consumer',
    courseId: 'everyday-law',
    lessonId: 'el-consumer',
    title: 'Consumer awareness',
    questions: [
      {
        id: 'q1',
        prompt: 'What is the first educational habit this lesson recommends after a defective purchase?',
        options: [
          { id: 'a', label: 'Delete all messages so the seller cannot see them' },
          { id: 'b', label: 'Keep bills and describe the defect through a written complaint channel' },
          { id: 'c', label: 'Assume Samvidhan can issue a refund' },
        ],
        correctOptionId: 'b',
        explanation: 'Documentation and the seller’s grievance path are the awareness steps taught here.',
      },
    ],
  },
  {
    id: 'quiz-dp-offences',
    courseId: 'digital-privacy',
    lessonId: 'dp-offences',
    title: 'Cyber awareness',
    questions: [
      {
        id: 'q1',
        prompt: 'Someone calls and asks for an OTP to “verify your refund”. What is the educational response?',
        options: [
          { id: 'a', label: 'Share the OTP so the refund is faster' },
          { id: 'b', label: 'Do not share the OTP; treat it as a likely fraud pattern and use official bank/cyber reporting' },
          { id: 'c', label: 'Post the OTP in a class group for advice' },
        ],
        correctOptionId: 'b',
        explanation: 'OTP sharing is a classic fraud pattern in awareness material. Use official channels.',
      },
    ],
  },
]

export const interestOptions = [
  'Constitution',
  'Fundamental Rights',
  'Parliament and institutions',
  'Consumer protection',
  'Employment basics',
  'Student life and campus rules',
  'Cybercrime and privacy',
  'Landmark judgments (study)',
]
