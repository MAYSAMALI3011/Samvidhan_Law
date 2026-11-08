import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppState } from '../../context/useAppState'

export function Toasts() {
  const { toasts, dismissToast } = useAppState()

  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const isSuccess = t.tone === 'success'
          const isError = t.tone === 'error'

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`toast samvidhan-toast toast-${t.tone}`}
              role="status"
            >
              <div className="toast-left">
                {isSuccess ? (
                  <CheckCircle size={18} className="toast-icon toast-icon-success" aria-hidden="true" />
                ) : isError ? (
                  <AlertCircle size={18} className="toast-icon toast-icon-error" aria-hidden="true" />
                ) : (
                  <Info size={18} className="toast-icon toast-icon-info" aria-hidden="true" />
                )}
                <span className="toast-msg">{t.message}</span>
              </div>

              <div className="toast-actions-cluster">
                {t.action && (
                  <button
                    type="button"
                    className="toast-action-btn"
                    onClick={() => {
                      t.action?.onAction()
                      dismissToast(t.id)
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  className="toast-close-btn"
                  aria-label="Dismiss notification"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export { Skeleton, CardSkeleton, StatSkeleton } from './Skeleton'

export function EmptyState({
  title,
  body,
  message,
  action,
  children,
}: {
  title: string
  body?: string
  message?: string
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="empty-state panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p className="muted" style={{ marginBottom: '1.25rem' }}>{body || message}</p>
      {action || children}
    </div>
  )
}
