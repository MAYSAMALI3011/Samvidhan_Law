import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  FileText,
  Landmark,
  Library,
  Scale,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'

export function MegaMenu() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user } = useAppState()

  const isInsideDashboard = location.pathname === '/dashboard' || Boolean(user)
  const constitutionPath = isInsideDashboard ? '/dashboard?tab=constitution' : '/constitution'
  const libraryPath = isInsideDashboard ? '/dashboard?tab=library' : '/library'
  const curriculumPath = isInsideDashboard ? '/dashboard?tab=courses' : '/learn'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isCurriculumActive = location.pathname.startsWith('/learn')
  const isConstitutionActive = location.pathname.startsWith('/constitution')
  const isLibraryActive = location.pathname.startsWith('/library')

  return (
    <div className="megamenu-nav-container" ref={menuRef}>
      {/* 1. Curriculum Trigger */}
      <div
        className="megamenu-trigger-wrapper"
        onMouseEnter={() => setOpenMenu('learn')}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <Link
          to={curriculumPath}
          className={`megamenu-nav-btn ${isCurriculumActive ? 'is-active-route' : ''} ${openMenu === 'learn' ? 'is-active' : ''}`}
          onClick={() => setOpenMenu(null)}
          aria-expanded={openMenu === 'learn'}
          aria-haspopup="true"
        >
          <span>Curriculum</span>
          <ChevronDown size={13} className={`megamenu-chevron ${openMenu === 'learn' ? 'is-open' : ''}`} aria-hidden="true" />
        </Link>

        {openMenu === 'learn' && (
          <div className="megamenu-dropdown-panel megamenu-cols-3" role="region" aria-label="Curriculum Navigation">
            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Basics</span>
              <Link to="/learn/constitutional-foundations" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Landmark size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Constitutional Foundations</strong>
                  <p className="megamenu-link-desc">The Preamble, how government branches balance each other, and basic rules.</p>
                </div>
              </Link>
              <Link to="/learn/citizenship-and-state" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Scale size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Citizenship & The State</strong>
                  <p className="megamenu-link-desc">Who is an Indian citizen, passport rules, and citizenship rights.</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Your Rights</span>
              <Link to="/learn/fundamental-rights-in-practice" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <ShieldAlert size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Fundamental Rights</strong>
                  <p className="megamenu-link-desc">Equality, freedom of speech, personal freedom, and going to court for help.</p>
                </div>
              </Link>
              <Link to="/learn/daily-life-protections" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <BookOpen size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Everyday Legal Protections</strong>
                  <p className="megamenu-link-desc">Consumer rights, tenant rules, workplace laws, and police complaints (FIR).</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column megamenu-featured-col">
              <div className="megamenu-featured-card">
                <span className="megamenu-featured-badge">Popular Course</span>
                <h4 className="megamenu-featured-title">Practical Citizen Guides</h4>
                <p className="megamenu-featured-desc">Step-by-step guides for filing RTI requests, sending legal notices, and consumer complaints.</p>
                <Link to="/learn/applied-civic-procedures" className="megamenu-featured-cta" onClick={() => setOpenMenu(null)}>
                  <span>Start Course</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Constitution Direct Link */}
      <Link
        to={constitutionPath}
        className={`megamenu-nav-btn single-link ${isConstitutionActive ? 'is-active-route' : ''}`}
      >
        <span>Constitution</span>
      </Link>

      {/* 3. Legal Library Trigger */}
      <div
        className="megamenu-trigger-wrapper"
        onMouseEnter={() => setOpenMenu('library')}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <Link
          to={libraryPath}
          className={`megamenu-nav-btn ${isLibraryActive ? 'is-active-route' : ''} ${openMenu === 'library' ? 'is-active' : ''}`}
          onClick={() => setOpenMenu(null)}
          aria-expanded={openMenu === 'library'}
          aria-haspopup="true"
        >
          <span>Legal Library</span>
          <ChevronDown size={13} className={`megamenu-chevron ${openMenu === 'library' ? 'is-open' : ''}`} aria-hidden="true" />
        </Link>

        {openMenu === 'library' && (
          <div className="megamenu-dropdown-panel megamenu-cols-2" role="region" aria-label="Legal Library Navigation">
            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Step-by-Step Guides</span>
              <Link to="/library/sample-rti-application" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <FileText size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">RTI Application Formats</strong>
                  <p className="megamenu-link-desc">Sample forms, small application fees, and how to appeal if you get no reply.</p>
                </div>
              </Link>
              <Link to="/library/fir-checklist" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <ShieldAlert size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Police & Arrest Checklist</strong>
                  <p className="megamenu-link-desc">Rules police must follow when arresting someone and your rights in custody.</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Library</span>
              <Link to="/library" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Library size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">All Legal Documents</strong>
                  <p className="megamenu-link-desc">Official Indian laws, ready-to-use sample letters, and court guides.</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}