import { BentoCard } from './BentoCard'
import {
  Briefcase,
  FileText,
  Home,
  Scale,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react'

const situationsData = [
  {
    id: 'rights',
    title: 'Fundamental Rights & Writ Petitions',
    badge: 'Part III of the Constitution',
    description: 'Enforce Article 14 equality, Article 19 freedoms, and Article 32 constitutional remedies against arbitrary state action.',
    actionLabel: 'Examine Part III Remedies',
    to: '/constitution/part-iii',
    icon: Scale,
    featured: true,
  },
  {
    id: 'police',
    title: 'Police Encounters & Arrest Safeguards',
    badge: 'Section 154 CrPC / D.K. Basu Guidelines',
    description: 'Mandatory rights upon arrest, zero FIR procedure, bail fundamentals, and memo inspection.',
    actionLabel: 'Explore Arrest Safeguards',
    to: '/library/fir-checklist',
    icon: ShieldAlert,
    featured: true,
  },
  {
    id: 'rti',
    title: 'Filing an RTI Application',
    badge: 'Right to Information Act, 2005',
    description: 'Demand transparency from public authorities, statutory deadlines, and query drafting.',
    actionLabel: 'Read RTI Filing Guide',
    to: '/library/sample-rti-application',
    icon: FileText,
    featured: false,
  },
  {
    id: 'consumer',
    title: 'Consumer Fraud & Defective Goods',
    badge: 'Consumer Protection Act, 2019',
    description: 'Identify misleading advertisements, calculate compensation jurisdiction, and file statutory notices.',
    actionLabel: 'View Consumer Checklist',
    to: '/library/sample-consumer-checklist',
    icon: ShoppingBag,
    featured: false,
  },
  {
    id: 'tenant',
    title: 'Tenant Rights & Security Deposits',
    badge: 'Model Tenancy Framework',
    description: 'Understand lawful eviction standards, rent agreement clauses, and deposit recovery mechanisms.',
    actionLabel: 'Review Tenancy Protections',
    to: '/learn/daily-life-protections',
    icon: Home,
    featured: false,
  },
  {
    id: 'workplace',
    title: 'Workplace Rights & Severance',
    badge: 'Industrial Relations & POSH Frameworks',
    description: 'Legal entitlements on notice periods, workplace harassment prevention, and fair wage rules.',
    actionLabel: 'Explore Workplace Law',
    to: '/learn/applied-civic-procedures',
    icon: Briefcase,
    featured: false,
  },
]

export function BentoGrid() {
  return (
    <div className="bento-grid-container" aria-label="Practical Legal Situations Grid">
      {situationsData.map((item) => (
        <BentoCard
          key={item.id}
          to={item.to}
          title={item.title}
          badge={item.badge}
          description={item.description}
          actionLabel={item.actionLabel}
          icon={item.icon}
          featured={item.featured}
        />
      ))}
    </div>
  )
}
