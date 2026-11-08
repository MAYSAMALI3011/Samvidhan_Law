export interface ConstitutionQuote {
  id: string
  text: string
  date: string
  context: string
  speaker: string
  role?: string
  source: string
}

export const ambedkarQuotes: ConstitutionQuote[] = [
  {
    id: 'ambedkar-vehicle-of-life',
    text: "Constitution is not a mere lawyers' document, it is a vehicle of Life, and its spirit is always the spirit of Age.",
    date: '25 Nov 1949',
    context: 'Constituent Assembly speech',
    speaker: 'Dr. B.R. Ambedkar',
    role: 'Chairman, Drafting Committee',
    source: 'Constituent Assembly speech, 25 November 1949',
  },
  {
    id: 'citizens-understanding',
    text: 'A Constitution is strongest when its citizens understand it.',
    date: 'Civic Creed',
    context: 'Samvidhan Philosophy',
    speaker: 'Constitutional Principle',
    role: 'Foundational Citizen Safeguard',
    source: 'Democratic Literacy Creed',
  },
  {
    id: 'ambedkar-1949-goodness',
    text: 'However good a Constitution may be, if those who are implementing it are not good, it will prove to be bad.',
    date: '25 Nov 1949',
    context: 'Constituent Assembly of India',
    speaker: 'Dr. B.R. Ambedkar',
    role: 'Chairman, Drafting Committee',
    source: 'CAD Vol. XI, pp. 972-981',
  },
]
