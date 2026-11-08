import { useState, useRef, useEffect } from 'react'
import { Share2, Check, Copy, MessageCircle, X } from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import './share-button.css'

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  className?: string
  label?: string
}

export function ShareButton({
  title = 'Samvidhan — Know Your Rights, Understand the Law',
  text = 'Master the Constitution of India and civic safeguards with structured learning.',
  url,
  className = '',
  label = 'Share',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { pushToast } = useAppState()

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // Handle native Web Share API on mobile devices if available
  const handleMainClick = async (e: React.MouseEvent) => {
    // If mobile touch device has navigator.share, try it first
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
      e.preventDefault()
      try {
        await navigator.share({ title, text, url: currentUrl })
        pushToast('Shared successfully!', 'success')
        return
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          setOpen((prev) => !prev)
        }
        return
      }
    }

    // Otherwise toggle popover
    setOpen((prev) => !prev)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      pushToast('Link copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      pushToast('Unable to copy link', 'error')
    }
  }

  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedText = encodeURIComponent(`${title} — ${text}`)

  const shareLinks = [
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: '#000000',
      icon: (
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: '#25D366',
      icon: <MessageCircle size={15} aria-hidden="true" />,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0077b5',
      icon: (
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66A1.66 1.66 0 0 0 7.83 6.2z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2',
      icon: (
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className={`samvidhan-share-popover-wrapper ${className}`} ref={menuRef}>
      {/* Gold gradient pill button with sheen & hover lift */}
      <button
        type="button"
        className={`samvidhan-share-btn ${open ? 'is-active' : ''}`}
        onClick={handleMainClick}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Share this constitutional lesson or resource"
      >
        <span className="share-btn-sheen" aria-hidden="true" />
        <Share2 size={15} className="share-btn-icon" aria-hidden="true" />
        <span className="share-btn-text">{label}</span>
      </button>

      {/* Social Popover Dialog */}
      {open && (
        <div className="share-popover-panel" role="dialog" aria-label="Share options">
          <div className="share-popover-header">
            <span className="share-popover-title">Share Knowledge</span>
            <button
              type="button"
              className="share-popover-close"
              onClick={() => setOpen(false)}
              aria-label="Close share menu"
            >
              <X size={14} />
            </button>
          </div>

          <div className="share-popover-grid">
            {shareLinks.map((item, idx) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="share-network-btn"
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => setOpen(false)}
              >
                <span className="network-icon" style={{ backgroundColor: item.color }}>
                  {item.icon}
                </span>
                <span className="network-name">{item.name}</span>
              </a>
            ))}
          </div>

          <div className="share-popover-footer">
            <button
              type="button"
              className={`share-copy-btn ${copied ? 'is-copied' : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-success" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Preserve backwards compatibility for ActionDropdown
export function ActionDropdown({
  label,
  items,
}: {
  label: string
  items: { label: string; onSelect: () => void }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      {open ? (
        <div role="menu" className="panel" style={{ position: 'absolute', right: 0, zIndex: 5, minWidth: '12rem', padding: '0.5rem' }}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
