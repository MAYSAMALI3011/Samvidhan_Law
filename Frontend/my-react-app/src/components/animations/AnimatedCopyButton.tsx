import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface AnimatedCopyButtonProps {
  textToCopy: string
  label?: string
  className?: string
  onCopied?: () => void
}

export function AnimatedCopyButton({
  textToCopy,
  label,
  className = '',
  onCopied,
}: AnimatedCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="animated-copy-wrap">
      {copied && (
        <div className="animated-copied-tooltip" role="status">
          <span>Copied!</span>
          <div className="tooltip-caret" />
        </div>
      )}

      <button
        type="button"
        className={`animated-copy-btn ${copied ? 'is-copied' : ''} ${className}`}
        onClick={handleCopy}
        aria-label={label || 'Copy citation to clipboard'}
        title="Copy citation"
      >
        {copied ? (
          <Check size={14} className="copy-check-icon" aria-hidden="true" />
        ) : (
          <Copy size={14} className="copy-idle-icon" aria-hidden="true" />
        )}
        {label && <span className="copy-btn-text">{copied ? 'Copied' : label}</span>}
      </button>
    </div>
  )
}
