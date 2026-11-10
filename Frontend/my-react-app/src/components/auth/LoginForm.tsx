import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'
import { PasswordField, AnimatedCheckbox, SubmitButton } from './AuthFields'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAppState } from '../../context/useAppState'
import { GhostComplete } from '../ui/TextFields.jsx'
import { validateEmail } from '../../utils/authValidation'
import { sanitizeReturnUrl } from '../../utils/redirect'
import { loginUser } from '../../services/apiClient'

interface LoginFormProps {
  onSwitchToSignup: () => void
  isActive: boolean
}

export function LoginForm({ onSwitchToSignup, isActive }: LoginFormProps) {
  const { demoSignIn, pushToast } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Autofocus first field when tab becomes active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        document.getElementById('ghost')?.focus()
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  const validate = () => {
    const errs: { email?: string; password?: string } = {}
    const emailErr = validateEmail(email)
    if (emailErr) {
      errs.email = emailErr
    }

    if (!password) {
      errs.password = 'Please enter your password'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    let result
    try {
      result = await loginUser({ email, password })
    } catch (err: unknown) {
      setIsLoading(false)
      const errorMsg =
        err instanceof Error && err.message
          ? err.message
          : 'Invalid email or password.'
      setErrors((prev) => ({ ...prev, password: errorMsg }))
      pushToast(errorMsg, 'error')
      return
    }
    setIsLoading(false)

    if (!result?.success || !result.user) {
      const errorMsg = result?.error || 'Invalid email or password.'
      setErrors((prev) => ({ ...prev, password: errorMsg }))
      pushToast(errorMsg, 'error')
      return
    }

    setIsSuccess(true)
    demoSignIn(result.user)
    pushToast(`Welcome back, ${result.user.name}!`, 'success')

    const params = new URLSearchParams(location.search)
    const rawReturnTo = params.get('returnTo') || (location.state as { from?: { pathname?: string } })?.from?.pathname
    const returnTo = sanitizeReturnUrl(rawReturnTo, '/dashboard')

    setTimeout(() => {
      navigate(returnTo)
    }, 450)
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1 className="auth-form-title">Log in</h1>
        <p className="auth-form-subtitle">Log in to continue learning.</p>
      </div>

      <SocialAuthButtons mode="login" />

      <form onSubmit={handleSubmit} noValidate className="auth-actual-form">
        <div style={{ marginBottom: '1rem' }}>
          <GhostComplete
            label="Email address"
            placeholder="citizen@example.com"
            value={email}
            onChange={(val) => {
              setEmail(val)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
          />
          {errors.email && (
            <p className="field-error-msg" role="alert" style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--warn, #f87171)' }}>
              {errors.email}
            </p>
          )}
        </div>

        <PasswordField
          label="Password"
          name="password"
          value={password}
          onChange={(val) => {
            setPassword(val)
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          onBlur={() => {
            if (password && password.length < 6) {
              setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }))
            }
          }}
          error={errors.password}
          icon={Lock}
          required
          autoComplete="current-password"
        />

        <div className="auth-form-aux-row">
          <AnimatedCheckbox
            id="login-remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />

          <Link to="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>

        <SubmitButton
          isLoading={isLoading}
          isSuccess={isSuccess}
          label="Log in"
          successLabel="Logged in!"
        />

        {/* Honest Notice */}
        <div className="auth-honest-notice">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Your progress is saved on this device for now.</span>
        </div>

        {/* Switch Link */}
        <div className="auth-switch-prompt">
          <span>Don&apos;t have an account?</span>{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="auth-switch-action-btn"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
