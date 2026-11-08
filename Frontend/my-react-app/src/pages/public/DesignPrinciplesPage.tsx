import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { BackButton } from '../../components/common/BackButton'

type UXTab = 'ux' | 'design'

const uxLaws = [
  {
    num: '01',
    name: "Jakob's Law",
    badge: 'Familiar Mental Models',
    desc: 'Citizens arrive with expectations from established reference tools. We use familiar legal structures (acts, articles, citations) so learners instantly understand how to navigate.',
  },
  {
    num: '02',
    name: "Hick's Law",
    badge: 'Choice Architecture',
    desc: 'Reducing decision overload by structuring the 395 constitutional articles into progressive, modular learning tracks instead of an overwhelming monolithic list.',
  },
  {
    num: '03',
    name: "Fitts's Law",
    badge: 'Touch & Reachability',
    desc: 'Primary actions, syllabus toggles, and Back buttons feature generous 44px+ hit targets with prominent placement for effortless navigation on mobile and desktop.',
  },
  {
    num: '04',
    name: "Miller's Law (7 ± 2)",
    badge: 'Cognitive Chunking',
    desc: 'Complex statutory texts are chunked into 3 to 5 digestible takeaways and step-by-step case scenarios, respecting short-term working memory limits.',
  },
  {
    num: '05',
    name: 'Law of Proximity',
    badge: 'Related Grouping',
    desc: 'Statutory citations are displayed immediately adjacent to plain-English translations and real-world implications, eliminating cross-page visual searching.',
  },
  {
    num: '06',
    name: 'Von Restorff Effect',
    badge: 'Distinctiveness',
    desc: 'Critical legal safeguards (e.g., Article 21, mandatory consumer statutory notices) are highlighted with sovereign gold accents so they immediately catch the eye.',
  },
  {
    num: '07',
    name: 'Serial Position Effect',
    badge: 'Primacy & Recency',
    desc: 'Key legal anchors (the Preamble at the beginning, actionable remedies & next steps at the end) are positioned where cognitive retention is naturally strongest.',
  },
  {
    num: '08',
    name: "Tesler's Law",
    badge: 'Complexity Conservation',
    desc: 'Law has unavoidable inherent complexity. The Samvidhan platform absorbs that complexity through intelligent summaries, keeping the citizen interface clean.',
  },
  {
    num: '09',
    name: 'Doherty Threshold',
    badge: '<400ms Feedback',
    desc: 'Search, article retrieval, and quiz answer verification trigger in under 400ms, maintaining citizen focus and eliminating interface lag.',
  },
  {
    num: '10',
    name: 'Peak-End Rule',
    badge: 'Memorable Milestones',
    desc: 'Quiz completions and lesson milestones finish on celebratory high points, providing clear performance analysis and encouraging continued daily study.',
  },
]

const designPrinciples = [
  {
    num: '01',
    name: 'Movement',
    badge: 'Directional Flow',
    desc: 'Visual cues, reading progress indicators, and subtle chevron vectors lead the learner naturally from constitutional theory to real-world citizen rights.',
  },
  {
    num: '02',
    name: 'Contrast',
    badge: 'Guaranteed Legibility',
    desc: 'Authoritative sovereign navy backgrounds paired with warm parchment surfaces and high-contrast typography, surpassing WCAG AAA readability standards.',
  },
  {
    num: '03',
    name: 'Balance',
    badge: 'Symmetrical Dignity',
    desc: 'Asymmetrical hero compositions balanced by illuminated constitutional codex cards, reflecting the stability and gravitas of the Supreme Court of India.',
  },
  {
    num: '04',
    name: 'Proportion & Scale',
    badge: 'Typographic Hierarchy',
    desc: 'Strict scale relationships from regal display serif headings down to sharp monospace statutory citations and micro-badges.',
  },
  {
    num: '05',
    name: 'Emphasis',
    badge: 'Focal Points',
    desc: 'Strategic application of sovereign gold accents directs attention to primary learning tasks and citizen remedies without visual clutter.',
  },
  {
    num: '06',
    name: 'Rhythm & Repetition',
    badge: 'Systemic Harmony',
    desc: 'Standardized card geometries, uniform icon weights, and consistent button radii create an intuitive, predictable learning rhythm.',
  },
  {
    num: '07',
    name: 'White Space',
    badge: 'Cognitive Calm',
    desc: 'Generous margins and uncluttered 68ch reading columns prevent visual fatigue when absorbing dense constitutional concepts.',
  },
  {
    num: '08',
    name: 'Unity & Harmony',
    badge: 'Singular Identity',
    desc: 'Every badge, drawer, button, and reading surface belongs to one unified design system inspired by Indian constitutional heritage.',
  },
  {
    num: '09',
    name: 'Hierarchy & Alignment',
    badge: 'Structural Order',
    desc: 'Strict baseline grids and left-aligned text hierarchies mirror the structured order of Indian statutory law and legal drafting.',
  },
]

export function DesignPrinciplesPage() {
  const [activeTab, setActiveTab] = useState<UXTab>('ux')

  usePageMeta({
    title: '19 Design Principles of Samvidhan',
    description: 'The cognitive science and design laws behind the Samvidhan legal education architecture.',
    path: '/design-principles',
  })

  return (
    <div className="container page-hero reading-layout">
      <BackButton to="/" label="Back to Home" />

      <div className="section-header">
        <div className="section-kicker-pill">
          <Sparkles size={14} aria-hidden="true" />
          <span>COGNITIVE SCIENCE & LEGAL DESIGN</span>
        </div>
        <h1>The 19 Laws of Samvidhan Design</h1>
        <p className="lead">
          Built upon 10 proven laws of human-computer interaction and 9 timeless design principles to make complex statutory law instantly intuitive.
        </p>

        <div className="ux-tab-toggle" role="tablist" aria-label="Design Principles Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ux'}
            className={`ux-toggle-btn ${activeTab === 'ux' ? 'active' : ''}`}
            onClick={() => setActiveTab('ux')}
          >
            10 UX Cognitive Laws
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'design'}
            className={`ux-toggle-btn ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
          >
            9 Principles of Visual Design
          </button>
        </div>
      </div>

      <div className="laws-cards-grid codex-fade-in" style={{ marginTop: '2.5rem' }}>
        {(activeTab === 'ux' ? uxLaws : designPrinciples).map((law) => (
          <div key={law.num} className="law-card">
            <div className="law-card-header">
              <span className="law-num">{law.num}</span>
              <span className="law-badge">{law.badge}</span>
            </div>
            <h3 className="law-title">{law.name}</h3>
            <p className="law-desc">{law.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
