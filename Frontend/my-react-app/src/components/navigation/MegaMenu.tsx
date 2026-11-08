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
              <span className="megamenu-col-eyebrow">Foundation</span>
              <Link to="/learn/constitutional-foundations" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Landmark size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Constitutional Foundations</strong>
                  <p className="megamenu-link-desc">Preamble philosophy, basic structure, separation of powers.</p>
                </div>
              </Link>
              <Link to="/learn/citizenship-and-state" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Scale size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Citizenship & The State</strong>
                  <p className="megamenu-link-desc">Part II nationality, domiciliary laws, and naturalization.</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Citizen Action</span>
              <Link to="/learn/fundamental-rights-in-practice" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <ShieldAlert size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Fundamental Rights</strong>
                  <p className="megamenu-link-desc">Articles 14, 19, 21, and Supreme Court writ petitions.</p>
                </div>
              </Link>
              <Link to="/learn/daily-life-protections" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <BookOpen size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Everyday Legal Protections</strong>
                  <p className="megamenu-link-desc">Consumer fraud, tenancy rights, workplace law & FIRs.</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column megamenu-featured-col">
              <div className="megamenu-featured-card">
                <span className="megamenu-featured-badge">Featured Syllabus</span>
                <h4 className="megamenu-featured-title">Applied Civic Procedures</h4>
                <p className="megamenu-featured-desc">Step-by-step statutory playbooks for RTI queries, legal notices, and consumer grievances.</p>
                <Link to="/learn/applied-civic-procedures" className="megamenu-featured-cta" onClick={() => setOpenMenu(null)}>
                  <span>Start Curriculum</span>
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
              <span className="megamenu-col-eyebrow">Statutory Guides</span>
              <Link to="/library/sample-rti-application" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <FileText size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">RTI Application Drafts</strong>
                  <p className="megamenu-link-desc">Format, statutory fees, and first appeal mechanisms.</p>
                </div>
              </Link>
              <Link to="/library/fir-checklist" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <ShieldAlert size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">FIR & Arrest Checklist</strong>
                  <p className="megamenu-link-desc">D.K. Basu guidelines and detention memos.</p>
                </div>
              </Link>
            </div>

            <div className="megamenu-column">
              <span className="megamenu-col-eyebrow">Repository</span>
              <Link to="/library" className="megamenu-link-card" onClick={() => setOpenMenu(null)}>
                <Library size={18} className="megamenu-link-icon" aria-hidden="true" />
                <div>
                  <strong className="megamenu-link-title">Full Document Catalogue</strong>
                  <p className="megamenu-link-desc">Verified central statutes, sample notices, and procedures.</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}