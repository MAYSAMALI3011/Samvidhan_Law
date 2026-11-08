import { useState } from 'react'
import { Landmark, TrendingUp, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { BackButton } from '../../components/common/BackButton'
import { useAppState } from '../../context/useAppState'
import { applyAffiliate } from '../../api/services/affiliateService'

export function AffiliatePage() {
  const { pushToast } = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [audience, setAudience] = useState('Law Students / Aspirants')
  const [submitted, setSubmitted] = useState(false)

  usePageMeta({
    title: 'Educator & Partner Affiliate Program — Samvidhan',
    description: 'Partner with Samvidhan to bring constitutional education to universities, law schools, and civic communities.',
    path: '/affiliates',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    try {
      const res = await applyAffiliate({
        name: name.trim(),
        email: email.trim(),
        audienceSize: audience,
        message: 'Application via Educator & Partner portal',
      })
      setSubmitted(true)
      pushToast(res.message, 'success')
    } catch {
      pushToast('Unable to submit affiliate application. Please try again.', 'error')
    }
  }

  return (
    <div className="container page-hero" style={{ maxWidth: '52rem' }}>
      <BackButton to="/" label="Back to Home" />

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p className="kicker">Institutional &amp; Educator Program</p>
        <h1 style={{ fontSize: '2.4rem', margin: '0.25rem 0 0.75rem' }}>
          Partner with Samvidhan to Expand Legal Literacy
        </h1>
        <p className="muted" style={{ fontSize: '1.1rem', maxWidth: '38rem', margin: '0 auto' }}>
          Are you a law professor, civic educator, legal influencer, or university society? Join our partner network and earn 30% recurring partner revenue.
        </p>
      </div>

      {/* Program Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <DollarSign size={28} className="text-gold" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>30% Commission</h3>
          <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
            Earn recurring revenue on every student or advocate who upgrades to Pro.
          </p>
        </div>

        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <TrendingUp size={28} className="text-gold" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>60-Day Cookie</h3>
          <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
            Receive credit for enrollments that occur within 60 days of their initial visit.
          </p>
        </div>

        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Landmark size={28} className="text-gold" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>Educator Portal</h3>
          <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
            Dedicated dashboard with cohort analytics, tracking links, and student progress graphs.
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="panel samvidhan-glow-card" style={{ padding: '2.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
          Apply for Partner Access
        </h2>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Fill in your details below. We approve accredited colleges, law faculties, and certified civic creators.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>Application Submitted</h3>
            <p className="muted" style={{ margin: 0 }}>
              We received your details. Check your email inbox for access verification instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Full Name / Organization
              </label>
              <input
                type="text"
                className="field-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. National Law School Society"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Official Email
              </label>
              <input
                type="email"
                className="field-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@institution.edu"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Primary Community / Audience
              </label>
              <select
                className="field-input"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="Law Students / Aspirants">Law Students &amp; Judicial Service Aspirants</option>
                <option value="Colleges & Universities">Colleges &amp; Universities</option>
                <option value="Civil Society / NGO">Civil Society &amp; NGO Members</option>
                <option value="Legal Practitioners">Legal Advocates &amp; Paralegals</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <span>Submit Partner Application</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
