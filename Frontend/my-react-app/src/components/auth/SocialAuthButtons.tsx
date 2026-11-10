import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'

interface SocialAuthButtonsProps {
  mode: 'signup' | 'login'
}

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const { demoSignIn, pushToast } = useAppState()
  const navigate = useNavigate()
  const [loadingProvider, setLoadingProvider] = useState<'Google' | 'Apple' | null>(null)

  const handleProviderAuth = (provider: 'Google' | 'Apple') => {
    setLoadingProvider(provider)
    setTimeout(() => {
      setLoadingProvider(null)
      demoSignIn({
        id: `usr_${provider.toLowerCase()}_${Date.now()}`,
        name: `${provider} Citizen`,
        email: `citizen.${provider.toLowerCase()}@samvidhan.law`,
        tier: 'free',
        interests: ['Preamble & Fundamental Rights', 'Consumer Protection'],
        role: 'learner',
      })
      pushToast(
        mode === 'signup'
          ? `Welcome to Samvidhan! Account created with ${provider}.`
          : `Welcome back! Logged in with ${provider}.`,
        'success'
      )
      navigate('/dashboard')
    }, 550)
  }

  const actionText = mode === 'signup' ? 'Sign up' : 'Continue'

  return (
    <div className="auth-social-container">
      <div className="auth-social-buttons-grid">
        {/* Google Button */}
        <button
          type="button"
          className="auth-social-btn auth-google-btn"
          onClick={() => handleProviderAuth('Google')}
          disabled={loadingProvider !== null}
          aria-label={`${actionText} with Google`}
        >
          {loadingProvider === 'Google' ? (
            <span className="auth-social-spinner" aria-hidden="true" />
          ) : (
            <svg className="auth-social-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{actionText} with Google</span>
        </button>

        {/* Apple Button */}
        <button
          type="button"
          className="auth-social-btn auth-apple-btn"
          onClick={() => handleProviderAuth('Apple')}
          disabled={loadingProvider !== null}
          aria-label={`${actionText} with Apple`}
        >
          {loadingProvider === 'Apple' ? (
            <span className="auth-social-spinner" aria-hidden="true" />
          ) : (
            <svg className="auth-social-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.1-1.92.98-3.04-.95.04-2.1.63-2.77 1.43-.6.69-1.12 1.83-1 2.93 1.06.08 2.13-.53 2.79-1.32z" />
            </svg>
          )}
          <span>{actionText} with Apple</span>
        </button>
      </div>

      {/* Styled Hairline Divider */}
      <div className="auth-social-divider" aria-hidden="true">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">or continue with email</span>
        <span className="auth-divider-line" />
      </div>
    </div>
  )
}
