import { ArrowRight, Landmark, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { constitutionTopics } from '../../data/mock/constitution'
import { getConstitutionTopic, getLesson } from '../../services/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { EmptyState } from '../../components/feedback/Toasts'
import { Breadcrumbs } from '../../components/common/ProgressBar'
import { BackButton } from '../../components/common/BackButton'
import { LawHistoryTimeline } from '../../components/learning/lesson/LawHistoryTimeline'

export function ConstitutionIndexPage() {
  usePageMeta({
    title: 'The Constitution of India — Reading Map',
    description: 'Study map of selected constitutional topics, parts, and core principles.',
    path: '/constitution',
  })

  return (
    <div className="container page-hero">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm back-to-dashboard-btn">
          <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="section-eyebrow" style={{ margin: 0 }}>
          <Landmark size={14} className="text-gold" aria-hidden="true" />
          Primary Source Archive
        </span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p className="kicker">Primary Source Map</p>
        <h1>The Constitution of India</h1>
        <p className="muted" style={{ maxWidth: '44rem', fontSize: '1.1rem' }}>
          An educational study map navigating key constitutional parts, fundamental rights, and democratic institutions. Cross-reference all principles against the official authorised text.
        </p>
      </div>

      {/* Illuminated Preamble Showcase */}
      <section className="preamble-banner" aria-label="The Preamble to the Constitution of India">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Landmark size={28} style={{ color: 'var(--gold)' }} aria-hidden="true" />
          <span className="eyebrow" style={{ color: 'var(--gold, #dfba73)', fontSize: '0.85rem' }}>
            Front Matter &middot; Sacred Foundation
          </span>
        </div>

        <h2>The Preamble</h2>
        <p className="preamble-quote-text" style={{ fontStyle: 'italic', fontSize: '1.12rem', lineHeight: '1.8' }}>
          "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;"
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(176, 141, 87, 0.3)' }}>
          <span className="preamble-adopted-date" style={{ fontSize: '0.88rem' }}>
            Adopted by the Constituent Assembly on 26th November 1949
          </span>
          <Link
            to="/constitution/preamble"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              color: 'var(--gold, #dfba73)',
              fontSize: '0.92rem',
            }}
          >
            <span>Read Preamble study note</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Part III & IV: Fundamental Rights & Citizen Duties */}
      <div className="constitution-part-header">
        <p className="kicker">Citizenship, Rights & Duties</p>
        <h2>Fundamental Guarantees & State Principles</h2>
      </div>

      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        {constitutionTopics
          .filter((t) => t.id === 'part-iii' || t.id === 'part-iv' || t.id === 'duties')
          .map((topic) => (
            <article className="card" key={topic.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--gold)',
                  background: 'var(--gold-light)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  width: 'fit-content',
                  marginBottom: '0.75rem',
                }}
              >
                {topic.part}
              </span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                <Link to={`/constitution/${topic.id}`} style={{ color: 'inherit' }}>
                  {topic.title}
                </Link>
              </h3>
              <p className="muted" style={{ fontSize: '0.92rem', flex: 1, margin: 0 }}>
                {topic.summary}
              </p>
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/constitution/${topic.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--gold)',
                  }}
                >
                  <span>Read topic analysis</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
      </div>

      {/* Part V: Union Governance & Judiciary */}
      <div className="constitution-part-header">
        <p className="kicker">Institutions of the Union</p>
        <h2>Parliament, Executive & The Judiciary</h2>
      </div>

      <div className="grid-2">
        {constitutionTopics
          .filter((t) => t.id === 'union-parliament' || t.id === 'judiciary')
          .map((topic) => (
            <article className="card" key={topic.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--gold)',
                  background: 'var(--gold-light)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  width: 'fit-content',
                  marginBottom: '0.75rem',
                }}
              >
                {topic.part}
              </span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                <Link to={`/constitution/${topic.id}`} style={{ color: 'inherit' }}>
                  {topic.title}
                </Link>
              </h3>
              <p className="muted" style={{ fontSize: '0.92rem', flex: 1, margin: 0 }}>
                {topic.summary}
              </p>
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/constitution/${topic.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--gold)',
                  }}
                >
                  <span>Explore institutional role</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
      </div>
    </div>
  )
}

export function ConstitutionTopicPage() {
  const { topicId = '' } = useParams()
  const topic = getConstitutionTopic(topicId)

  usePageMeta({
    title: topic?.title ?? 'Topic',
    description: topic?.summary ?? 'Constitution topic',
    path: `/constitution/${topicId}`,
  })

  if (!topic) {
    return <EmptyState title="Topic not found" body="That constitution topic is not in the sample set." />
  }

  return (
    <article className="container reading-layout page-hero">
      <BackButton to="/constitution" label="Back to Constitution Index" />
      <Breadcrumbs
        items={[
          { to: '/constitution', label: 'Constitution' },
          { label: topic.title },
        ]}
      />

      <header style={{ marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--gold)',
            background: 'var(--gold-light)',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            display: 'inline-block',
            marginBottom: '0.5rem',
          }}
        >
          {topic.part}
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)' }}>{topic.title}</h1>
        <p className="muted" style={{ fontSize: '1.15rem', lineHeight: '1.6', margin: 0 }}>
          {topic.summary}
        </p>

        <div className="banner warn" style={{ marginTop: '1.5rem' }}>
          <ShieldCheck size={20} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span>{topic.sourceNote}</span>
        </div>
      </header>

      {topic.lawHistory && (
        <section style={{ marginBottom: '2rem' }}>
          <LawHistoryTimeline history={topic.lawHistory} />
        </section>
      )}

      <div className="reading">
        {topic.sections.map((s, idx) => (
          <section key={idx} style={{ marginBottom: '2.5rem' }}>
            <h2>{s.heading}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </div>

      {topic.relatedLessonIds?.length ? (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <p className="kicker">Practical Application</p>
          <h2>Related Curriculum Lessons</h2>
          <p className="muted">Apply these constitutional principles through sequenced classroom lessons.</p>

          <div className="grid-2" style={{ marginTop: '1.25rem' }}>
            {topic.relatedLessonIds.map((id) => {
              const lesson = getLesson(id)
              if (!lesson) return null
              return (
                <article className="card" key={id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="eyebrow">{lesson.durationMinutes} min read</span>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '0.35rem' }}>
                    <Link to={`/learn/${lesson.courseId}/${lesson.id}`}>{lesson.title}</Link>
                  </h3>
                  <p className="muted" style={{ fontSize: '0.88rem', margin: 0, flex: 1 }}>
                    {lesson.summary}
                  </p>
                  <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link
                      to={`/learn/${lesson.courseId}/${lesson.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--gold)',
                      }}
                    >
                      <span>Study lesson</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </article>
  )
}


