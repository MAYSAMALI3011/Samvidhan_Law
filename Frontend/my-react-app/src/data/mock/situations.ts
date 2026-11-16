export interface SituationCard {
  id: string
  title: string
  badge: string
  description: string
  actionLabel: string
  to: string
  iconName: 'FileText' | 'ShieldAlert' | 'ShoppingBag' | 'Home' | 'Briefcase' | 'Scale'
}

export const situations: SituationCard[] = [
  {
    id: 'rti',
    title: 'Filing an RTI (Right to Information)',
    badge: 'RTI Act, 2005',
    description: 'Ask government offices for official records, understand reply deadlines (30 days), and write simple questions.',
    actionLabel: 'Read RTI Guide',
    to: '/library/sample-rti-application',
    iconName: 'FileText',
  },
  {
    id: 'police',
    title: 'Police Questions & Arrest Rights',
    badge: 'Section 154 CrPC & D.K. Basu Rules',
    description: 'Learn your rights if stopped or arrested, how to file a Zero FIR at any police station, and how bail works.',
    actionLabel: 'See Arrest Rights',
    to: '/library/fir-checklist',
    iconName: 'ShieldAlert',
  },
  {
    id: 'consumer',
    title: 'Defective Products & Online Scams',
    badge: 'Consumer Protection Act, 2019',
    description: 'Spot fake ads, get refunds or replacements for faulty products, and send a legal complaint letter.',
    actionLabel: 'View Consumer Guide',
    to: '/library/sample-consumer-checklist',
    iconName: 'ShoppingBag',
  },
  {
    id: 'tenant',
    title: 'Tenant Rights & Security Deposits',
    badge: 'Rent Laws & Model Tenancy Act',
    description: 'Know your rights against unfair eviction, read rent agreements with care, and get your security deposit back.',
    actionLabel: 'Read Tenant Rights',
    to: '/learn/daily-life-protections',
    iconName: 'Home',
  },
  {
    id: 'workplace',
    title: 'Workplace Rights & Safety',
    badge: 'Labour Laws & POSH Rules',
    description: 'Learn your rights regarding job notice periods, fair salary, and protection against harassment at work.',
    actionLabel: 'Explore Workplace Rights',
    to: '/learn/applied-civic-procedures',
    iconName: 'Briefcase',
  },
  {
    id: 'rights',
    title: 'When Your Basic Rights Are Broken',
    badge: 'Part III of the Constitution of India',
    description: 'Learn what to do if someone treats you unfairly, stops your free speech, or if you need help from court.',
    actionLabel: 'Read Fundamental Rights',
    to: '/constitution/part-iii',
    iconName: 'Scale',
  },
]
