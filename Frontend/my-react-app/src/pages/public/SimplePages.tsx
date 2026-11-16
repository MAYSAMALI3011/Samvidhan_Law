import { useState } from 'react'
import {
  ArrowRight,
  Send,
  ShieldAlert,
  ShieldCheck,
  Search,
  RotateCcw,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../../components/common/Button'
import { Field, TextInput } from '../../components/common/Field'
import { Accordion } from '../../components/common/Disclosure'
import { faqs } from '../../data/mock/faqs'
import { useAppState } from '../../context/useAppState'
import { usePageMeta } from '../../hooks/usePageMeta'
import { BrandMark } from '../../components/brand/BrandMark'
import { MorMascot } from '../../components/mascot/MorMascot'
import { AutoGrowTextarea } from '../../components/ui/TextFields.jsx'
import { submitContact } from '../../api/services/contactService'

export function HowItWorksPage() {
  usePageMeta({
    title: 'How It Works',
    description: "How learning on Samvidhan is organized.",
    path: '/how-it-works',
  })

  return (
    <div className="container page-hero reading-layout">
      <div className="simple-page-header">
        <p className="kicker">How It Works</p>
        <h1>How Samvidhan Works</h1>
        <p className="simple-page-subtitle">
          Short lessons. Real-life examples. An easy Constitution reader. Step-by-step citizen guides. And a friendly legal helper to answer your questions.
        </p>
      </div>

      <div className="simple-steps-stack">
        {[
          {
            step: '01',
            title: 'Pick Any Course',
            desc: 'Start with basic citizen rights or choose topics from daily life. Everything is free for everyone.',
          },
          {
            step: '02',
            title: 'Read Simple Lessons',
            desc: 'Every lesson explains the law in plain English, with real stories and key points to remember.',
          },
          {
            step: '03',
            title: 'Test What You Learned',
            desc: 'Check your knowledge with quick quizzes and see clear explanations for every answer.',
          },
          {
            step: '04',
            title: 'Check the Official Law',
            desc: 'You can always read the official articles in our Constitution reader and Legal Library.',
          },
        ].map((item) => (
          <article className="card simple-step-item" key={item.step}>
            <div className="simple-step-num">
              {item.step}
            </div>
            <div>
              <h3 className="simple-step-title">{item.title}</h3>
              <p className="simple-step-desc">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="simple-page-cta">
        <ButtonLink to="/learn" variant="gold">
          <span>Explore courses now</span>
          <ArrowRight size={17} aria-hidden="true" />
        </ButtonLink>
      </div>
    </div>
  )
}

export function AboutPage() {
  usePageMeta({
    title: 'About Samvidhan',
    description: 'The mission and principles of Samvidhan.',
    path: '/about',
  })

  return (
    <div className="container page-hero reading-layout">
      <div className="simple-page-header">
        <p className="kicker">About the Project</p>
        <h1>Our Mission</h1>
        <p className="simple-page-subtitle">
          Helping everyone understand the Constitution of India and their everyday rights in simple, clear English.
        </p>
      </div>

      <div className="reading">
        <p>
          Indian law can often feel complicated and hard to read, with long words and confusing court procedures. Because of this, many people do not know their basic rights when talking to police, signing rent agreements, or solving daily problems.
        </p>
        <p>
          <strong>Samvidhan</strong> was built to change that. We give students, workers, and everyday citizens clear, friendly explanations of the Constitution and Indian laws, with references to the official legal texts.
        </p>

        <h2>Brand & Identity System</h2>
        <div className="panel brand-panel">
          <BrandMark variant="stacked" height={120} />
          <div className="brand-panel-text">
            <h3 className="brand-panel-title">Concept A: The Scales & The Book</h3>
            <p className="brand-panel-desc">
              Our visual identity pairs the classic scales of justice with the open volume of the Indian Constitution, executed in Imperial Gold and Sovereign Navy.
            </p>
          </div>
        </div>

        <h2>Core Guiding Principles</h2>
        <ul>
          <li><strong>Simple Words:</strong> Clear explanations without confusing legal jargon.</li>
          <li><strong>Based on Real Law:</strong> Every lesson connects to real Articles, Acts, and court rulings.</li>
          <li><strong>Safe & Helpful:</strong> Friendly learning tools designed to teach you your rights, not to replace a lawyer.</li>
        </ul>
      </div>
    </div>
  )
}

export function ContactPage() {
  const { pushToast } = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  usePageMeta({
    title: 'Contact Samvidhan',
    description: 'Contact the Samvidhan project team.',
    path: '/contact',
  })

  return (
    <div className="container page-hero contact-container">
      <p className="kicker">Get in Touch</p>
      <h1>Contact the Team</h1>
      <p className="muted">
        Have questions, feedback on curriculum modules, or suggestions for civic topics? Send us a message.
      </p>

      <div className="banner warn">
        <ShieldCheck size={20} aria-hidden="true" />
        <span>Contact our civic education and curriculum team. We typically respond within two business days.</span>
      </div>

      <form
        className="form contact-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!name.trim() || !email.trim() || !message.trim()) {
            setError('Please complete all required fields.')
            return
          }
          setError('')
          try {
            const res = await submitContact({
              name: name.trim(),
              email: email.trim(),
              message: message.trim(),
            })
            pushToast(res.message, 'success')
            setName('')
            setEmail('')
            setMessage('')
          } catch {
            pushToast('Unable to send message right now. Please try again.', 'error')
          }
        }}
      >
        <Field label="Your Name" error={error && !name.trim() ? 'Name is required' : undefined}>
          <TextInput
            placeholder="Priya Sen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="Email Address" error={error && !email.trim() ? 'Email is required' : undefined}>
          <TextInput
            type="email"
            placeholder="priya@example.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <div style={{ marginBottom: '1.25rem' }}>
          <AutoGrowTextarea
            label="Message or Feedback"
            placeholder="Share thoughts on a lesson, suggest a legal topic, or report an issue..."
            value={message}
            onChange={(val) => setMessage(val)}
          />
          {error && !message.trim() ? (
            <span className="field-error" style={{ display: 'block', marginTop: '0.35rem', color: 'var(--danger)', fontSize: '0.84rem' }}>
              Message is required
            </span>
          ) : null}
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <Button type="submit" variant="gold">
          <Send size={16} aria-hidden="true" />
          <span>Send Message</span>
        </Button>
      </form>
    </div>
  )
}

export function PrivacyPage() {
  usePageMeta({
    title: 'Privacy Policy',
    description: 'Privacy principles of Samvidhan.',
    path: '/privacy',
  })

  return (
    <div className="container page-hero reading-layout">
      <div className="banner info" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldCheck size={20} className="text-gold" aria-hidden="true" />
        <span style={{ fontSize: '0.9rem' }}>
          <strong>Draft for Civic Educational Platform</strong> • Subject to formal legal counsel review. Local storage first, zero tracking.
        </span>
      </div>
      <p className="kicker">Transparency</p>
      <h1>Privacy Policy</h1>
      <div className="reading">
        <p>
          This educational platform operates in privacy-first mode within your browser. User preferences, theme settings, bookmark indices, and quiz completion records are kept in local storage.
        </p>
        <p>
          No user profiles, credentials, or personal queries are transmitted to third-party data brokers or remote tracking providers.
        </p>
        <h2>Production Safeguards</h2>
        <p>
          The platform enforces data minimization, granular consent mechanisms, and adherence to applicable Indian digital data protection standards (DPDP Act).
        </p>
      </div>
    </div>
  )
}

export function TermsPage() {
  usePageMeta({
    title: 'Terms of Use',
    description: 'Terms of use for the Samvidhan educational platform.',
    path: '/terms',
  })

  return (
    <div className="container page-hero reading-layout">
      <div className="banner info" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldCheck size={20} className="text-gold" aria-hidden="true" />
        <span style={{ fontSize: '0.9rem' }}>
          <strong>Draft Terms</strong> • Educational platform framework. Always verify with the Official Gazette of India.
        </span>
      </div>
      <p className="kicker">Legal Terms</p>
      <h1>Terms of Use</h1>
      <div className="reading">
        <p>
          Samvidhan is provided strictly for educational purposes and civic literacy. Content is summarized and illustrative and should not be relied upon as comprehensive statutory code or legal counsel.
        </p>
        <p>
          Authentication, consultation, and interactive features depicted across this site are educational demonstrations. Always verify provisions with the Official Gazette of India.
        </p>
      </div>
    </div>
  )
}

export function ComingSoonPage({ topic = 'This Feature' }: { topic?: string }) {
  usePageMeta({
    title: `${topic} — Coming Soon`,
    description: 'This section is currently being researched and authored.',
  })

  return (
    <div className="container page-hero not-found-wrapper" style={{ textAlign: 'center', maxWidth: '42rem' }}>
      <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
        <MorMascot mood="reading" size={100} />
      </div>
      <p className="kicker">Under Research &amp; Development</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '0.25rem 0 0.75rem' }}>
        {topic} is Arriving Soon
      </h1>
      <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '0 0 2rem' }}>
        Our civic research team is actively compiling verified statutory breakdowns and learning tracks for this section. In the meantime, explore our foundational curriculum.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <ButtonLink to="/learn" variant="gold">
          <span>Explore Curriculum</span>
          <ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          <span>Return Home</span>
        </ButtonLink>
      </div>
    </div>
  )
}

export function DisclaimerPage() {
  usePageMeta({
    title: 'Legal Disclaimer',
    description: 'Educational disclaimer regarding Samvidhan materials.',
    path: '/disclaimer',
  })

  return (
    <div className="container page-hero reading-layout">
      <p className="kicker">Important Notice</p>
      <h1>Educational Disclaimer</h1>

      <div className="banner warn disclaimer-banner-wrap">
        <ShieldAlert size={24} aria-hidden="true" />
        <div>
          <strong className="disclaimer-heading-badge">
            Educational Platform • Not Legal Advice
          </strong>
          <span>
            Samvidhan is a free learning website and not a law firm. The information here is to help you learn your rights, not to give formal legal advice or represent you in court.
          </span>
        </div>
      </div>

      <div className="reading">
        <p>
          Laws can change over time through new court decisions and government amendments. The lessons, checklists, and guides on Samvidhan are simplified explanations to help citizens learn about the law.
        </p>
        <p>
          If you are facing an urgent legal problem, police investigation, or court case, please consult a licensed lawyer (advocate) for personal advice.
        </p>

        <h2>Frequently Asked Questions</h2>
        <div className="faq-stack">
          {faqs.slice(0, 4).map((f) => (
            <Accordion key={f.q} title={f.q}>
              {f.a}
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  usePageMeta({
    title: 'Page Not Found — 404',
    description: 'The requested Samvidhan page does not exist.',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="container page-hero not-found-wrapper" style={{ textAlign: 'center', maxWidth: '44rem' }}>
      <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
        <MorMascot mood="thinking" size={110} />
      </div>
      <p className="kicker">Error 404</p>
      <h1 className="not-found-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', margin: '0.25rem 0 0.75rem' }}>
        We Couldn&apos;t Find That Page
      </h1>
      <p className="not-found-text" style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '0 0 1.75rem' }}>
        We could not find the page or article you were looking for. Search below or pick a popular topic.
      </p>

      {/* Inline Search Box */}
      <form onSubmit={handleSearch} style={{ maxWidth: '420px', margin: '0 auto 2rem', display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} className="text-gold" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="field-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search lessons, articles, acts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>

      {/* Quick Navigation Popular Links */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
          Popular Destinations
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          <Link to="/learn" className="suggestion-pill">The Preamble &amp; Sovereignty</Link>
          <Link to="/constitution" className="suggestion-pill">Fundamental Rights (Part III)</Link>
          <Link to="/library" className="suggestion-pill">Legal Library &amp; RTI Guide</Link>
          <Link to="/dashboard" className="suggestion-pill">Learner Dashboard</Link>
        </div>
      </div>

      <div className="not-found-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <ButtonLink to="/learn" variant="gold">
          <span>Explore Curriculum</span>
          <ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          <span>Return to Homepage</span>
        </ButtonLink>
      </div>
    </div>
  )
}

export function ServerErrorPage({ error, onReload }: { error?: string; onReload?: () => void }) {
  usePageMeta({
    title: '500 — Server Condition Interrupted',
    description: 'An internal condition occurred. Please reload.',
  })

  return (
    <div className="container page-hero" style={{ textAlign: 'center', maxWidth: '40rem', padding: '4rem 1.5rem' }}>
      <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
        <MorMascot mood="thinking" size={100} />
      </div>
      <p className="kicker">Status 500</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', margin: '0.25rem 0 0.75rem' }}>
        Something Went Wrong
      </h1>
      <p className="muted" style={{ fontSize: '1.05rem', margin: '0 0 1.5rem' }}>
        We ran into a small problem loading this page. Please try reloading. Your learning progress is saved safely.
      </p>

      {error && (
        <pre style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '0.8rem', color: '#f87171', overflowX: 'auto', marginBottom: '1.5rem' }}>
          {error}
        </pre>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (onReload ? onReload() : window.location.reload())}
        >
          <RotateCcw size={16} />
          <span>Reload Page</span>
        </button>
        <Link to="/contact" className="btn btn-secondary">
          <span>Contact Support</span>
        </Link>
      </div>
    </div>
  )
}
