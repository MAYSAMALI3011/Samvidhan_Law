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
    title: 'Filing an RTI Application',
    badge: 'Right to Information Act, 2005',
    description: 'Demand transparency from public authorities, understand statutory deadlines, and draft effective queries.',
    actionLabel: 'Read RTI Filing Guide',
    to: '/library/sample-rti-application',
    iconName: 'FileText',
  },
  {
    id: 'police',
    title: 'Police Encounter & FIR Safeguards',
    badge: 'Section 154 CrPC / D.K. Basu Guidelines',
    description: 'Know your mandatory rights upon arrest, zero FIR procedure, bail fundamentals, and memo inspection.',
    actionLabel: 'Explore Arrest Safeguards',
    to: '/library/fir-checklist',
    iconName: 'ShieldAlert',
  },
  {
    id: 'consumer',
    title: 'Consumer Fraud & Defective Goods',
    badge: 'Consumer Protection Act, 2019',
    description: 'Identify misleading advertisements, calculate compensation jurisdiction, and file statutory notices.',
    actionLabel: 'View Consumer Checklist',
    to: '/library/sample-consumer-checklist',
    iconName: 'ShoppingBag',
  },
  {
    id: 'tenant',
    title: 'Tenant Rights & Security Deposits',
    badge: 'Model Tenancy Act & State Rent Laws',
    description: 'Understand lawful eviction standards, rent agreement clauses, and deposit recovery mechanisms.',
    actionLabel: 'Review Tenancy Protections',
    to: '/learn/daily-life-protections',
    iconName: 'Home',
  },
  {
    id: 'workplace',
    title: 'Workplace Rights & Severance',
    badge: 'Industrial Relations & POSH Frameworks',
    description: 'Learn your legal entitlements on notice periods, workplace harassment prevention, and fair wage rules.',
    actionLabel: 'Explore Workplace Law',
    to: '/learn/applied-civic-procedures',
    iconName: 'Briefcase',
  },
  {
    id: 'rights',
    title: 'Fundamental Rights Violations',
    badge: 'Part III of the Constitution of India',
    description: 'Identify unconstitutional discrimination under Article 14, speech rights under 19, and habeas corpus under 32.',
    actionLabel: 'Examine Part III Articles',
    to: '/constitution/part-iii',
    iconName: 'Scale',
  },
]
