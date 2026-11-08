import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import './feedback.css'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  scope?: string
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.scope || 'App'}]`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: '' })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-wrapper" role="alert">
          <div className="error-boundary-card samvidhan-glow-card">
            <div className="error-boundary-icon-box" aria-hidden="true">
              <AlertOctagon size={32} />
            </div>

            <h2 className="error-boundary-title">
              {this.props.scope ? `Problem loading ${this.props.scope}` : 'Something went wrong'}
            </h2>

            <p className="error-boundary-desc">
              An unexpected condition interrupted this section. Your progress and saved articles are preserved safely.
            </p>

            {this.state.errorId && (
              <span className="error-id-badge">
                Reference Code: <code>{this.state.errorId}</code>
              </span>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={this.handleReset}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Try Again</span>
              </button>

              <a href="/" className="btn btn-secondary btn-sm">
                <Home size={14} aria-hidden="true" />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
