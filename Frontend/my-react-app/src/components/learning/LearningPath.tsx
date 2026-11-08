import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Check,
  Lock,
  Star,
    FileText,
  X,
  ChevronRight,
  Gift,
          } from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import { unitsData } from '../../data/mock/learningUnits'
import { MorMascot } from '../mascot/MorMascot'

export interface PathNode {
  id: string
  unitId: number
  type: 'lesson' | 'chest' | 'quiz'
  title: string
  subtitle: string
  articleRef: string
  href: string
  xp: number
  status: 'completed' | 'current' | 'locked' | 'legendary'
  xOffset: number
  stars?: number
}

type UnitData = (typeof unitsData)[number]
type LessonData = UnitData['lessons'][number]

export function LearningPath() {
  const { progress, openChest, playSound, pushToast } = useAppState()
  const [activeGuidebook, setActiveGuidebook] = useState<UnitData | null>(null)
  const [openedChestId, setOpenedChestId] = useState<string | null>(null)
  const currentNodeRef = useRef<HTMLDivElement>(null)

  const completedIds = progress.completedLessonIds || []
  const openedChests = progress.chestsOpened || []

  // Start at top of page on load (no auto-scroll down to nodes)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault()
    playSound('wrong')
    pushToast('Complete the previous lessons to unlock this milestone!', 'error')
  }

  const handleChestClick = (chestId: string) => {
    if (openedChests.includes(chestId)) {
      pushToast('You already claimed this constitutional chest!', 'info')
      return
    }
    setOpenedChestId(chestId)
    openChest(chestId, 25)
    setTimeout(() => setOpenedChestId(null), 2500)
  }

  return (
    <div className="duo-path-wrapper" role="region" aria-label="Curriculum Learning Path">
      {unitsData.map((unit) => {
        return (
          <section key={unit.id} className="duo-unit-section" aria-labelledby={`unit-head-${unit.id}`}>
            {/* Sticky Unit Header Banner */}
            <div className="duo-unit-banner samvidhan-glow-card">
              <div className="duo-unit-meta">
                <span className="duo-unit-kicker">{unit.kicker}</span>
                <h3 id={`unit-head-${unit.id}`} className="duo-unit-title">
                  {unit.title}
                </h3>
                <p className="duo-unit-desc">{unit.description}</p>
              </div>

              <div className="duo-unit-actions">
                <button
                  type="button"
                  className="btn duo-guidebook-btn"
                  onClick={() => {
                    playSound('pop')
                    setActiveGuidebook(unit)
                  }}
                  aria-label={`Open guidebook for ${unit.title}`}
                >
                  <BookOpen size={16} aria-hidden="true" />
                  <span>Guidebook</span>
                </button>
              </div>
            </div>

            {/* Vertical Winding Path */}
            <div className="duo-path-track">
              {unit.lessons.map((lesson: LessonData, idx: number) => {
                const isCompleted = completedIds.includes(lesson.id)
                // Current if previous is completed (or first lesson) and not yet completed
                const isFirst = idx === 0 && unit.id === 1
                const prevCompleted = idx > 0 ? completedIds.includes(unit.lessons[idx - 1].id) : true
                const isCurrent = !isCompleted && (isFirst || prevCompleted)
                const isLocked = !isCompleted && !isCurrent

                // Smooth, balanced alternating sinusoidal offsets for centered winding path
                const offsets = [0, -28, 0, 28, 0]
                const xOffset = offsets[idx % offsets.length]
                const chestId = `chest-${unit.id}-${lesson.id}`
                const chestClaimed = openedChests.includes(chestId)

                return (
                  <React.Fragment key={lesson.id}>
                    {/* Lesson Node */}
                    <div
                      ref={isCurrent ? currentNodeRef : undefined}
                      className="duo-node-row"
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      {/* Floating START / RESUME pill */}
                      {isCurrent && (
                        <div className="duo-start-bubble" aria-hidden="true">
                          <MorMascot mood="head-only" size={24} />
                          <span className="start-pill-text">START</span>
                          <div className="bubble-arrow" />
                        </div>
                      )}

                      {/* Node Button */}
                      {isLocked ? (
                        <button
                          type="button"
                          className="duo-path-node is-locked"
                          onClick={handleLockedClick}
                          title="Finish previous lesson to unlock"
                          aria-label={`${lesson.title} (Locked)`}
                        >
                          <div className="duo-node-inner">
                            <Lock size={20} className="node-icon locked-icon" aria-hidden="true" />
                          </div>
                        </button>
                      ) : (
                        <Link
                          to={`/learn/${unit.slug}/${lesson.id}`}
                          className={`duo-path-node ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''}`}
                          onClick={() => playSound('pop')}
                          aria-label={`${lesson.title} - ${isCompleted ? 'Completed' : 'Ready'}`}
                        >
                          <div className="duo-node-inner">
                            {isCompleted ? (
                              <Check size={26} className="node-icon check-icon" strokeWidth={3} aria-hidden="true" />
                            ) : (
                              <Star size={24} className="node-icon star-icon" aria-hidden="true" />
                            )}
                          </div>
                          {isCurrent && <div className="duo-pulse-ring" aria-hidden="true" />}
                        </Link>
                      )}

                      {/* Stars for Completed Lessons */}
                      {isCompleted && (
                        <div className="node-stars-row" aria-label="3 of 3 stars earned">
                          <Star size={11} className="star-gold fill-gold" />
                          <Star size={11} className="star-gold fill-gold" />
                          <Star size={11} className="star-gold fill-gold" />
                        </div>
                      )}

                      {/* Node Label Caption */}
                      <div className="duo-node-caption">
                        <strong className="duo-node-name">{lesson.title}</strong>
                        <span className="duo-node-sub">{lesson.subtitle}</span>
                        <span className="duo-node-tag">{lesson.articleCitation}</span>
                      </div>
                    </div>

                    {/* Treasure Chest Bonus Node between lessons - centered milestone reward */}
                    {idx === 1 && (
                      <div className="duo-node-row duo-chest-row" style={{ transform: 'translateX(0px)' }}>
                        <div className="duo-path-connector-line" aria-hidden="true" />
                        <button
                          type="button"
                          className={`duo-chest-node ${chestClaimed ? 'is-opened' : 'is-ready'}`}
                          onClick={() => handleChestClick(chestId)}
                          aria-label={chestClaimed ? 'Treasure chest opened' : 'Open mystery constitutional chest'}
                        >
                          <Gift size={24} className={`chest-icon ${openedChestId === chestId ? 'spin-burst' : ''}`} />
                          {!chestClaimed && <span className="chest-sparkle-pill">+25 XP</span>}
                        </button>
                        <span className="duo-chest-caption">{chestClaimed ? 'Claimed' : 'Bonus Reward'}</span>
                        <div className="duo-path-connector-line" aria-hidden="true" />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Guidebook Modal */}
      {activeGuidebook && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guidebook-title">
          <div className="guidebook-modal samvidhan-glow-card">
            <div className="guidebook-header">
              <div className="guidebook-head-title">
                <FileText size={20} className="guidebook-icon text-gold" aria-hidden="true" />
                <h3 id="guidebook-title">{activeGuidebook.title} &bull; Key Notes</h3>
              </div>
              <button
                type="button"
                className="guidebook-close-btn"
                onClick={() => setActiveGuidebook(null)}
                aria-label="Close guidebook"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="guidebook-content">
              <div className="guidebook-block">
                <h4 className="guidebook-section-head">Core Statutory Doctrines</h4>
                <ul className="guidebook-principles-list">
                  <li>
                    <span className="bullet-point text-gold">&bull;</span>
                    <span><strong>Sovereignty:</strong> Authority resides unconditionally with "We, The People of India".</span>
                  </li>
                  <li>
                    <span className="bullet-point text-gold">&bull;</span>
                    <span><strong>Basic Structure:</strong> In Kesavananda Bharati (1973), the Supreme Court ruled that Article 368 does not grant power to destroy democracy or judicial independence.</span>
                  </li>
                  <li>
                    <span className="bullet-point text-gold">&bull;</span>
                    <span><strong>Rule of Law:</strong> Executive officers cannot act arbitrarily; every action requires enacted statutory backing.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="guidebook-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveGuidebook(null)}
              >
                <span>Return to Path</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
