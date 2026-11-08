import { useId, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className={`accordion-card samvidhan-glow-card ${open ? 'is-open' : ''}`}>
      <h3>
        <button
          type="button"
          className="accordion-trigger"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <span className="accordion-title-text">{title}</span>
          <span className="accordion-icon-wrap" aria-hidden="true">
            <Plus size={18} className={`accordion-plus-icon ${open ? 'is-rotated' : ''}`} />
          </span>
        </button>
      </h3>
      <div
        id={id}
        className="accordion-content-panel"
        role="region"
        aria-hidden={!open}
      >
        <div className="accordion-inner-body">
          <div className="accordion-text-content">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="modal-scrim" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
        <ButtonRow onClose={onClose} />
      </div>
    </div>
  )
}

function ButtonRow({ onClose }: { onClose: () => void }) {
  return (
    <p>
      <button className="btn secondary" type="button" onClick={onClose}>
        Close
      </button>
    </p>
  )
}
