import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { CheckOption } from '../../components/common/Field'
import { interestOptions } from '../../data/mock/curriculum'
import { useAppState } from '../../context/useAppState'
import { usePageMeta } from '../../hooks/usePageMeta'
import { BrandMark } from '../../components/brand/BrandMark'
import { AuthShell } from '../../components/auth/AuthShell'
import { GhostComplete, PasswordStrength, scorePassword } from '../../components/ui/TextFields.jsx'
import { resetPasswordSchema, validateEmail } from '../../utils/authValidation'

function DemoBanner() {
  return (
    <div className="login-demo-notice" role="note">
      <ShieldAlert size={18} className="demo-shield-icon" aria-hidden="true" />
      <span>Demonstration Mode: Educational profile stored locally in this browser.</span>
    </div>
  )
}

export function AuthPage({ defaultMode = 'login' }: { defaultMode?: 'login' | 'signup' }) {
  return <AuthShell initialMode={defaultMode} />
}

export function LoginPage() {
  return <AuthShell initialMode="login" />
}

export function SignupPage() {
  return <AuthShell initialMode="signup" />
}

export function ForgotPasswordPage() {
  const { pushToast } = useAppState()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [errors, setErrors] = useState<Record<string, string>>({})

  usePageMeta({
    title: 'Password Recovery — Samvidhan',
    description: 'Demo password recovery screen.',
    path: '/forgot-password',
  })

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) {
      setErrors({ email: emailErr })
      return
    }
    setErrors({})
    setStep('reset')
    pushToast(`Verification dispatched to ${email}. Choose a new password below.`, 'info')
  }

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = resetPasswordSchema.safeParse({ password: newPassword, confirmPassword })
    if (!result.success) {
      const errMap: Record<string, string> = {}
      result.error.issues.forEach((i) => {
        errMap[String(i.path[0])] = i.message
      })
      setErrors(errMap)
      return
    }
    setErrors({})
    pushToast('Password reset successfully! You can now log in.', 'success')
    window.location.href = '/login'
  }

  const isPasswordGood = scorePassword(newPassword) >= 3

  return (
    <div className="container page-hero" style={{ maxWidth: '32rem', paddingBlock: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }} aria-label="Samvidhan Home">
          <BrandMark height={48} />
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reset Password</h1>
        <p className="muted" style={{ margin: 0 }}>
          {step === 'request' ? 'Simulation screen for account password recovery' : 'Set a strong new password for your citizen account'}
        </p>
      </div>

      <div className="panel" style={{ background: 'var(--surface)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <DemoBanner />

        {step === 'request' ? (
          <form className="form" style={{ maxWidth: '100%', display: 'grid', gap: '1.25rem' }} onSubmit={handleRequestSubmit}>
            <GhostComplete
              label="Registered Email Address"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(val) => {
                setEmail(val)
                if (errors.email) setErrors({})
              }}
            />
            {errors.email && (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--warn, #f87171)' }}>{errors.email}</p>
            )}

            <Button type="submit" variant="gold" style={{ width: '100%' }}>
              <span>Send Reset Instructions (Demo)</span>
            </Button>

            <div style={{ textAlign: 'center', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                Return to log in
              </Link>
            </div>
          </form>
        ) : (
          <form className="form" style={{ maxWidth: '100%', display: 'grid', gap: '1.25rem' }} onSubmit={handleResetSubmit}>
            <PasswordStrength
              label="New Password"
              value={newPassword}
              onChange={(val) => {
                setNewPassword(val)
                if (errors.password) setErrors({})
              }}
            />
            {errors.password && (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--warn, #f87171)' }}>{errors.password}</p>
            )}

            <div className="tf">
              <label className="tf__label" htmlFor="reset-confirm-pwd">Confirm New Password</label>
              <input
                id="reset-confirm-pwd"
                type="password"
                className="tf__box"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              {errors.confirmPassword && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--warn, #f87171)' }}>{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gold"
              disabled={!isPasswordGood || !confirmPassword || newPassword !== confirmPassword}
              style={{ width: '100%' }}
            >
              <span>Update Password</span>
            </Button>

            {!isPasswordGood && newPassword.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Button unlocks when password reaches at least <strong>Good</strong> strength.
              </p>
            )}

            <div style={{ textAlign: 'center', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep('request')}
                style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
              >
                ← Back to email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const { user, demoSignIn, pushToast } = useAppState()
  const [selected, setSelected] = useState<string[]>(user?.interests ?? [])
  const navigate = useNavigate()

  usePageMeta({
    title: 'Customize Your Interests ? Samvidhan',
    description: 'Choose learning interests to highlight inside the curriculum.',
    path: '/onboarding',
  })

  function toggle(item: string) {
    setSelected((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]))
  }

  return (
    <div className="container page-hero" style={{ maxWidth: '44rem', paddingBlock: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="kicker" style={{ justifyContent: 'center' }}>Step 2 of 2</p>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>What Would You Like to Emphasize?</h1>
        <p className="muted" style={{ maxWidth: '34rem', marginInline: 'auto' }}>
          Select legal domains you wish to prioritize. This personalizes recommended lessons inside the unified curriculum.
        </p>
      </div>

      <div
        className="panel"
        style={{
          background: 'var(--surface)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <div className="grid-2">
          {interestOptions.map((item) => (
            <div
              key={item}
              style={{
                padding: '0.85rem 1rem',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: selected.includes(item) ? 'var(--gold-light)' : 'var(--surface)',
                borderColor: selected.includes(item) ? 'var(--gold)' : 'var(--border)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <CheckOption checked={selected.includes(item)} onChange={() => toggle(item)}>
                <strong>{item}</strong>
              </CheckOption>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="gold"
            onClick={() => {
              demoSignIn({
                name: user?.name ?? 'Learner',
                email: user?.email ?? 'demo@samvidhan.local',
                interests: selected,
              })
              pushToast('Interests saved! Welcome to your dashboard.', 'success')
              navigate('/dashboard')
            }}
            style={{ paddingInline: '2rem' }}
          >
            <span>Continue to Dashboard</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
