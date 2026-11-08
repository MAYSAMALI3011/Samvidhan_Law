import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import './feedback.css'

export interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  requireConfirmationText?: string // e.g. "DELETE"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  requireConfirmationText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typedInput, setTypedInput] = useState('')
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setTypedInput('')
        cancelBtnRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const isConfirmed = requireConfirmationText
    ? typedInput.trim().toUpperCase() === requireConfirmationText.toUpperCase()
    : true

  return (
    <div
      className="confirm-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div
        className="confirm-modal-panel samvidhan-glow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-close-btn"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="confirm-icon-box">
          {isDestructive ? (
            <div className="danger-icon-circle">
              <Trash2 size={24} aria-hidden="true" />
            </div>
          ) : (
            <div className="warning-icon-circle">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
          )}
        </div>

        <h2 id="confirm-modal-title" className="confirm-title">
          {title}
        </h2>
        <p id="confirm-modal-desc" className="confirm-desc">
          {description}
        </p>

        {requireConfirmationText && (
          <div className="confirm-type-box">
            <label htmlFor="confirm-type-input" className="confirm-type-label">
              Please type <strong>{requireConfirmationText}</strong> to confirm:
            </label>
            <input
              id="confirm-type-input"
              type="text"
              className="confirm-type-input"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requireConfirmationText}
              autoComplete="off"
            />
          </div>
        )}

        <div className="confirm-actions-row">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary confirm-cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`btn ${isDestructive ? 'confirm-danger-btn' : 'btn-primary'}`}
            disabled={!isConfirmed}
            onClick={() => {
              if (isConfirmed) onConfirm()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
