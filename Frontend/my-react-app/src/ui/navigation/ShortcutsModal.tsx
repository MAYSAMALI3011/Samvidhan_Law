import { useEffect, useRef } from 'react'
import { X, Keyboard } from 'lucide-react'
import { shortcutItems } from './shortcutsData'
import './navigation.css'

export interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="shortcuts-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="shortcuts-modal-panel"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-modal-header">
          <div className="shortcuts-header-title-box">
            <Keyboard size={20} className="text-gold" aria-hidden="true" />
            <h2 id="shortcuts-modal-title" className="shortcuts-title">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            className="shortcuts-close-btn"
            onClick={onClose}
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        <p className="shortcuts-subtitle">
          Power-user keys to navigate Samvidhan faster from anywhere on your keyboard.
        </p>

        <div className="shortcuts-list" role="list">
          {shortcutItems.map((item, idx) => (
            <div key={idx} className="shortcut-row" role="listitem">
              <span className="shortcut-desc">{item.description}</span>
              <div className="shortcut-keys">
                {item.keys.map((k, kIdx) => (
                  <span key={kIdx} className="shortcut-key-wrapper">
                    <kbd className="shortcut-kbd">{k}</kbd>
                    {kIdx < item.keys.length - 1 && <span className="shortcut-then">then</span>}
                  </span>
                ))}
                {item.altKeys && (
                  <>
                    <span className="shortcut-or">or</span>
                    {item.altKeys.map((ak, akIdx) => (
                      <kbd key={akIdx} className="shortcut-kbd">
                        {ak}
                      </kbd>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span>Tip: Shortcuts are paused while typing inside search and text fields.</span>
        </div>
      </div>
    </div>
  )
}
