export interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  avatarText: string
  quote: string
  verifiedOutcome: string
}

export const testimonials: Testimonial[] = [
  {
    id: 'aditi',
    name: 'Aditi Sharma',
    role: 'Civil Services Aspirant',
    location: 'New Delhi',
    avatarText: 'AS',
    quote:
      'Samvidhan turns dense constitutional jurisprudence into crystal-clear legal principles. Grounding every lesson in original Supreme Court citations gave me genuine confidence for mains exam preparation.',
    verifiedOutcome: 'Mastered Part III & IV in 3 weeks',
  },
  {
    id: 'rajesh',
    name: 'Rajesh Menon',
    role: 'Small Business Owner',
    location: 'Bengaluru',
    avatarText: 'RM',
    quote:
      'When faced with an unfair vendor contract and consumer dispute, the step-by-step statutory checklist helped me understand my legal rights before consulting our counsel.',
    verifiedOutcome: 'Filed verified consumer grievance',
  },
  {
    id: 'priya',
    name: 'Priya Kulkarni',
    role: 'Senior Civics Educator',
    location: 'Pune',
    avatarText: 'PK',
    quote:
      'My students used to find legal texts dry and intimidating. The interactive Preamble codex and situational case studies transformed their classroom participation overnight.',
    verifiedOutcome: 'Implemented across 4 school batches',
  },
]

export interface Advisor {
  id: string
  name: string
  role: string
  affiliation: string
  focus: string
}

export const advisors: Advisor[] = [
  {
    id: 'sen',
    name: 'Adv. Vikramaditya Sen',
    role: 'Senior Advocate (Constitutional Law)',
    affiliation: 'Supreme Court Bar Association',
    focus: 'Fundamental Rights & Writ Jurisdiction Reviewer',
  },
  {
    id: 'narayanan',
    name: 'Prof. Meenakshi Narayanan',
    role: 'Professor of Public Law',
    affiliation: 'National Law University',
    focus: 'Curriculum Accuracy & Pedagogical Advisor',
  },
  {
    id: 'patel',
    name: 'Devendra Patel',
    role: 'Civic Technology Fellow',
    affiliation: 'Center for Legal Literacy & Access',
    focus: 'Plain-English Statutory Translation Specialist',
  },
]
