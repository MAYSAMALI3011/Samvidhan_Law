import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, ShieldCheck, MailCheck, RotateCcw } from 'lucide-react'
import { InputField, AnimatedCheckbox, SubmitButton } from './AuthFields'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAppState } from '../../context/useAppState'
import { OtpInput, PasswordStrength, GhostComplete, scorePassword } from '../ui/TextFields.jsx'
import { verifyEmailOtp, resendVerificationCode, signupUser } from '../../services/apiClient'
import { signupSchema } from '../../utils/authValidation'

interface SignupFormProps {
  onSwitchToLogin: () => void
  isActive: boolean
}

export function SignupForm({ onSwitchToLogin, isActive }: SignupFormProps) {
  const { demoSignIn, pushToast } = useAppState()
  const navigate = useNavigate()

  // Form mode: 'details' | 'otp'
  const [mode, setMode] = useState<'details' | 'otp'>('details')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Resend cooldown timer in seconds
  const [resendCooldown, setResendCooldown] = useState(0)

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null)

  // Autofocus first field when tab becomes active
  useEffect(() => {
    if (isActive && mode === 'details') {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus()
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isActive, mode])

  // Cooldown countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const passwordScore = scorePassword(password)
  const isPasswordAdequate = passwordScore >= 3 // "Good" or "Strong"

  const validate = () => {
    const parseResult = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      agreeTerms,
    })

    if (parseResult.success) {
      setErrors({})
      return true
    }

    const formatted: typeof errors = {}
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as keyof typeof errors
      if (field && !formatted[field]) {
        formatted[field] = issue.message
      }
    }
    setErrors(formatted)
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    let result
    try {
      result = await signupUser({ name, email, password })
    } catch (err: unknown) {
      setIsLoading(false)
      const errorMsg =
        err instanceof Error && err.message
          ? err.message
          : 'Sign-up is unavailable'
      setErrors((prev) => ({ ...prev, email: errorMsg }))
      pushToast(errorMsg, 'error')
      return
    }
    setIsLoading(false)

    if (!result?.success) {
      const errorMsg = result?.error || 'Sign-up is unavailable'
      setErrors((prev) => ({ ...prev, email: errorMsg }))
      pushToast(errorMsg, 'error')
      return
    }

    setMode('otp')
    setResendCooldown(30)
    pushToast(`Verification code dispatched to ${email}`, 'info')
  }

  // Handle OTP completion via apiClient
  const handleVerifyOtp = async (code: string): Promise<boolean> => {
    try {
      const verified = await verifyEmailOtp(email, code)

      if (verified) {
        setIsSuccess(true)
        setTimeout(() => {
          demoSignIn({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            interests: ['Constitutional Law', 'Citizen Rights'],
            role: 'learner',
            tier: 'free',
            aiUsageToday: 0,
          })
          pushToast('Email verified! Welcome to Samvidhan.', 'success')
          setTimeout(() => {
            navigate('/onboarding')
          }, 500)
        }, 600)
        return true
      }

      pushToast('Invalid verification code. Please try again.', 'error')
      return false
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message ? err.message : 'Invalid code. Please try again.'
      pushToast(msg, 'error')
      return false
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    try {
      const message = await resendVerificationCode(email)
      setResendCooldown(60)
      pushToast(message || `A fresh verification code was sent to ${email}`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message ? err.message : 'Unable to resend code.'
      pushToast(msg, 'error')
    }
  }

  // OTP Verification View
  if (mode === 'otp') {
    return (
      <div className="auth-form-container" role="region" aria-label="Email Verification Step">
        <div className="auth-form-header" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(176, 141, 87, 0.15)',
              border: '1px solid rgba(176, 141, 87, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: 'var(--gold)',
            }}
          >
            <MailCheck size={26} />
          </div>
          <h1 className="auth-form-title">Verify your email</h1>
          <p className="auth-form-subtitle" style={{ maxWidth: '380px', margin: '0 auto' }}>
            We sent a 6-digit confirmation code to <strong>{email}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <OtpInput
            length={6}
            label="Enter verification code"
            onComplete={handleVerifyOtp}
          />

          {/* 30-Second Cooldown Resend Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {resendCooldown > 0 ? (
              <span className="tf__hint" style={{ color: 'var(--text-muted)' }}>
                Resend code in <strong>{resendCooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={14} />
                <span>Resend verification code</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setMode('details')}
            className="auth-switch-action-btn"
            style={{ fontSize: '0.86rem' }}
          >
            ← Back to account details
          </button>
        </div>
      </div>
    )
  }

  // Account Details Form
  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1 className="auth-form-title">Create your free account</h1>
        <p className="auth-form-subtitle">It takes less than a minute.</p>
      </div>

      <SocialAuthButtons mode="signup" />

      <form onSubmit={handleSubmit} noValidate className="auth-actual-form">
        <InputField
          inputRef={nameInputRef}
          label="Full name"
          name="name"
          placeholder="e.g. Priya Sharma"
          value={name}
          onChange={(val) => {
            setName(val)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          onBlur={() => {
            if (!name.trim()) setErrors((prev) => ({ ...prev, name: 'Please enter your full name' }))
          }}
          error={errors.name}
          icon={User}
          required
          autoComplete="name"
        />

        {/* Animated GhostComplete for Email */}
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

        {/* Animated PasswordStrength Meter */}
        <div style={{ marginBottom: '1rem' }}>
          <PasswordStrength
            label="Create password"
            value={password}
            onChange={(val) => {
              setPassword(val)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
          />
          {errors.password && (
            <p className="field-error-msg" role="alert" style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--warn, #f87171)' }}>
              {errors.password}
            </p>
          )}
        </div>

        <InputField
          label="Confirm password"
          name="confirm-password"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val)
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          onBlur={() => {
            if (confirmPassword && confirmPassword !== password) {
              setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
            }
          }}
          error={errors.confirmPassword}
          icon={Lock}
          required
          autoComplete="new-password"
        />

        <AnimatedCheckbox
          id="signup-agree-terms"
          checked={agreeTerms}
          onChange={(checked) => {
            setAgreeTerms(checked)
            if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
          }}
          label={
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="auth-inline-link">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" className="auth-inline-link">
                Privacy Policy
              </Link>
            </span>
          }
          error={errors.terms}
        />

        {/* Submit Button stays disabled below 'Good' strength per requirement */}
        <SubmitButton
          isLoading={isLoading}
          isSuccess={isSuccess}
          label="Create account & Verify"
          successLabel="Account created!"
          disabled={!isPasswordAdequate || !agreeTerms || !name || !email}
        />

        {!isPasswordAdequate && password.length > 0 && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>
            Submit is unlocked when password reaches at least <strong>Good</strong> strength.
          </p>
        )}

        {/* Honest Notice */}
        <div className="auth-honest-notice">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Your progress is saved on this device for now.</span>
        </div>

        {/* Switch Link */}
        <div className="auth-switch-prompt">
          <span>Already have an account?</span>{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-switch-action-btn"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}
