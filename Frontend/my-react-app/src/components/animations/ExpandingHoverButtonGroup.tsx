import React, { useState } from 'react'
import { Share2, Bookmark, Check, Copy } from 'lucide-react'
import { useAppState } from '../../context/useAppState'

interface ExpandingHoverButtonGroupProps {
  title: string
  url?: string
  lessonId?: string
}

export function ExpandingHoverButtonGroup({
  title,
  url,
  lessonId,
}: ExpandingHoverButtonGroupProps) {
  const [copied, setCopied] = useState(false)
  const { toggleBookmark, progress, pushToast } = useAppState()

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const isBookmarked = lessonId ? progress.bookmarks.includes(lessonId) : false

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      pushToast('Link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      pushToast('Could not copy link', 'error')
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (lessonId) {
      toggleBookmark(lessonId)
      pushToast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'info')
    }
  }

  return (
    <div className="expanding-btn-group" aria-label="Social sharing and actions">
      <button
        type="button"
        className="expanding-btn-trigger"
        aria-label="Share and save actions"
        title="Share"
      >
        <Share2 size={16} aria-hidden="true" />
      </button>

      <div className="expanding-btn-fan">
        {lessonId && (
          <button
            type="button"
            className={`expanding-btn-item ${isBookmarked ? 'is-active' : ''}`}
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            aria-label="Toggle bookmark"
          >
            <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          className="expanding-btn-item"
          onClick={handleCopy}
          title="Copy link"
          aria-label="Copy page link"
        >
          {copied ? <Check size={15} style={{ color: 'var(--success)' }} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>

        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noreferrer"
          className="expanding-btn-item"
          title="Share on X"
          aria-label="Share on X"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noreferrer"
          className="expanding-btn-item"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66A1.66 1.66 0 0 0 7.83 6.2z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
