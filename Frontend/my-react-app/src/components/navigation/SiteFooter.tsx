import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../brand/BrandMark'
import { ShieldAlert, CheckCircle2, ArrowUp, Send, Loader2 } from 'lucide-react'
import { SocialIcons } from '../common/SocialIcons'
import { Tooltip } from '../animations/Tooltip'
import { useAppState } from '../../context/useAppState'
import { GhostComplete } from '../ui/TextFields.jsx'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const footerRef = useRef<HTMLElement>(null)
  const { pushToast } = useAppState()

  // IntersectionObserver entrance animation (fade-up on scroll)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please provide a valid email address.')
      pushToast('Please enter a valid email address.', 'error')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubscribed(true)
      pushToast("You're subscribed to the Gazette Briefing!", 'success')
      setEmail('')
    }, 450)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      ref={footerRef}
      className={`site-footer deluxe-footer ${isVisible ? 'is-visible' : ''}`}
      aria-label="Site Footer"
    >
      {/* Flowing Multilayer Parallax Waves */}
      <div className="footer-wave-flow-wrap" aria-hidden="true">
        <svg
          className="footer-waves-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="footer-gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="footer-wave-parallax">
            <use href="#footer-gentle-wave" x="48" y="0" className="wave-layer wave-layer-1" />
            <use href="#footer-gentle-wave" x="48" y="3" className="wave-layer wave-layer-2" />
            <use href="#footer-gentle-wave" x="48" y="5" className="wave-layer wave-layer-3" />
            <use href="#footer-gentle-wave" x="48" y="7" className="wave-layer wave-layer-4" />
          </g>
        </svg>
      </div>

      <div className="footer-inner-content">
        {/* 4-Column Responsive Grid */}
        <div className="container footer-grid-4col">
          {/* Column 1: Brand & Glass Socials */}
          <div className="footer-col footer-brand-col">
            <Link to="/" aria-label="Samvidhan home" className="footer-brand-logo-link">
              <BrandMark onDark height={44} />
            </Link>
            <p className="footer-brand-tagline">
              Understand Indian law. Master your constitutional safeguards. Build civic confidence with verified statutory citations.
            </p>
            <div className="footer-social-wrapper">
              <span className="footer-social-label">Connect</span>
              <SocialIcons variant="glass" showLabels={true} />
            </div>
          </div>

          {/* Column 2: Learn */}
          <nav className="footer-col" aria-label="Learning Resources">
            <h4 className="footer-col-title">Learn</h4>
            <ul className="footer-link-list">
              <li><Link to="/learn" className="footer-nav-anchor">Curriculum &amp; Courses</Link></li>
              <li><Link to="/constitution" className="footer-nav-anchor">The Constitution of India</Link></li>
              <li><Link to="/library" className="footer-nav-anchor">Statutory Library &amp; Guides</Link></li>
              <li>
                <Link to="/ask" className="footer-nav-anchor footer-preview-link">
                  <span>Ask Samvidhan</span>
                  <span className="footer-pill-preview-badge">PREVIEW</span>
                </Link>
              </li>
              <li><Link to="/design-principles" className="footer-nav-anchor">Design Principles</Link></li>
            </ul>
          </nav>

          {/* Column 3: Platform */}
          <nav className="footer-col" aria-label="Platform and Community">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-link-list">
              <li><Link to="/how-it-works" className="footer-nav-anchor">How It Works</Link></li>
              <li><Link to="/about" className="footer-nav-anchor">About Samvidhan</Link></li>
              <li><Link to="/search" className="footer-nav-anchor">Search Catalogue</Link></li>
              <li><Link to="/contact" className="footer-nav-anchor">Contact &amp; Feedback</Link></li>
              <li><Link to="/settings" className="footer-nav-anchor">Settings &amp; Theme</Link></li>
            </ul>
          </nav>

          {/* Column 4: Gazette Briefing Newsletter (Joined Pill Form) */}
          <div className="footer-col footer-newsletter-col">
            <h4 className="footer-col-title">Gazette Briefing</h4>
            <p className="footer-newsletter-desc">
              Monthly executive summaries on landmark Supreme Court rulings, constitutional debates, and citizen rights.
            </p>

            {subscribed ? (
              <div className="footer-subscribed-pill" role="status">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>You're subscribed &check;</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-newsletter-pill-form" noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <GhostComplete
                    label=""
                    value={email}
                    onChange={(val) => {
                      setEmail(val)
                      if (error) setError('')
                    }}
                    placeholder="citizen@example.in"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="newsletter-joined-btn"
                    style={{ borderRadius: '8px', width: 'fit-content', padding: '0.45rem 1rem' }}
                    aria-label="Subscribe to Gazette Briefing"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="spinner" aria-hidden="true" />
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send size={13} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
                {error && <span className="newsletter-inline-error" role="alert">{error}</span>}
              </form>
            )}
            <span className="newsletter-privacy-note">Zero spam. Official citations only. Unsubscribe anytime.</span>
          </div>
        </div>

        {/* Horizontal Navigation Row Above Copyright */}
        <div className="container footer-horizontal-nav-row">
          <nav className="footer-horizontal-links" aria-label="Quick directory">
            <Link to="/" className="footer-slide-link">Home</Link>
            <span className="footer-nav-separator" aria-hidden="true">&bull;</span>
            <Link to="/learn" className="footer-slide-link">Curriculum</Link>
            <span className="footer-nav-separator" aria-hidden="true">&bull;</span>
            <Link to="/constitution" className="footer-slide-link">Constitution</Link>
            <span className="footer-nav-separator" aria-hidden="true">&bull;</span>
            <Link to="/library" className="footer-slide-link">Legal Library</Link>
            <span className="footer-nav-separator" aria-hidden="true">&bull;</span>
            <Link to="/contact" className="footer-slide-link">Contact</Link>
          </nav>
        </div>

        {/* Full Unclipped Educational Disclaimer Box */}
        <div className="container footer-disclaimer-wrapper">
          <div className="footer-disclaimer-card">
            <ShieldAlert size={20} className="footer-disclaimer-shield text-gold" aria-hidden="true" />
            <div className="footer-disclaimer-body">
              <strong className="footer-disclaimer-heading">Educational Literacy Notice &amp; Legal Disclaimer</strong>
              <p className="footer-disclaimer-text">
                Samvidhan is an independent non-commercial civic education project and is not a law firm or court registry.
                Platform content, interactive curriculum modules, statutory breakdowns, and answers generated by the Ask Samvidhan
                research assistant are strictly for civic literacy, academic reference, and public awareness. They do not constitute
                formal legal advice, solicit legal representation, or create an attorney-client relationship. Always cross-reference
                statutory provisions with the Gazette of India or consult a licensed advocate for actionable counsel.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Links, and Back-to-Top Button */}
        <div className="container footer-bottom-bar">
          <p className="footer-copyright-text">
            &copy; {new Date().getFullYear()} Samvidhan. Built for citizen empowerment.
          </p>

          <div className="footer-legal-and-backtop">
            <div className="footer-policy-row">
              <Link to="/disclaimer" className="footer-policy-anchor">Legal Disclaimer</Link>
              <span className="footer-dot-divider" aria-hidden="true">&bull;</span>
              <Link to="/privacy" className="footer-policy-anchor">Privacy Policy</Link>
              <span className="footer-dot-divider" aria-hidden="true">&bull;</span>
              <Link to="/terms" className="footer-policy-anchor">Terms of Service</Link>
            </div>

            <Tooltip content="Scroll back to top of page" position="top">
              <button
                type="button"
                className="footer-back-to-top-btn"
                onClick={scrollToTop}
                aria-label="Back to top"
              >
                <ArrowUp size={16} aria-hidden="true" />
                <span className="back-top-label">Top</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  )
}
