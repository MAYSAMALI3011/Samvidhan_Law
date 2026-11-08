import type { DemoUser } from '../types'

/**
 * API Client for Samvidhan Auth & Verification
 *
 * Rules:
 * - Mock mode is strictly forbidden in production builds (import.meta.env.PROD === true).
 * - In development, mock mode is enabled when VITE_USE_MOCKS !== 'false'.
 * - In production without a configured backend, requests fail closed with a safe error message.
 */

export interface AuthResponse {
  success: boolean
  user?: DemoUser
  error?: string
}

export function isMockMode(): boolean {
  if (import.meta.env.PROD) {
    return false // Never allow mock mode in production builds
  }
  return import.meta.env.VITE_USE_MOCKS !== 'false'
}

const getApiBase = (): string => {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
}

/**
 * Sign in user with email & password
 */
export async function loginUser(credentials: { email: string; password: string }): Promise<AuthResponse> {
  const email = credentials.email.trim().toLowerCase()
  const isMock = isMockMode()

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const derivedName = email.split('@')[0].replace(/[._-]/g, ' ')
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1)

    return {
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name: formattedName || 'Citizen Learner',
        email,
        interests: ['Constitutional Law', 'Citizen Rights'],
        role: 'learner',
        tier: 'free',
        aiUsageToday: 0,
      },
    }
  }

  const apiBase = getApiBase()
  if (import.meta.env.PROD && !apiBase) {
    return {
      success: false,
      error: 'Sign-in is unavailable. Please connect a backend API or try again later.',
    }
  }

  try {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: credentials.password }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Invalid email or password. Please try again.',
      }
    }

    const data = await res.json()
    return { success: true, user: data.user }
  } catch (err) {
    console.error('Login request failed:', err)
    return {
      success: false,
      error: 'Unable to reach the server. Please check your connection.',
    }
  }
}

/**
 * Register a new user account
 */
export async function signupUser(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const email = payload.email.trim().toLowerCase()
  const isMock = isMockMode()

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name: payload.name.trim(),
        email,
        interests: ['Constitutional Law', 'Citizen Rights'],
        role: 'learner',
        tier: 'free',
        aiUsageToday: 0,
      },
    }
  }

  const apiBase = getApiBase()
  if (import.meta.env.PROD && !apiBase) {
    return {
      success: false,
      error: 'Sign-up is unavailable. Please connect a backend API or try again later.',
    }
  }

  try {
    const res = await fetch(`${apiBase}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name.trim(),
        email,
        password: payload.password,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Registration failed. Please try again.',
      }
    }

    const data = await res.json()
    return { success: true, user: data.user }
  } catch (err) {
    console.error('Signup request failed:', err)
    return {
      success: false,
      error: 'Unable to reach the server. Please check your connection.',
    }
  }
}

/**
 * Verify 6-digit email OTP (fails closed in PROD)
 */
export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  const isMock = isMockMode()

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    // Standard mock verification rule: 6 digits, accepts 482913 or any valid 6 digits (except 000000)
    return /^\d{6}$/.test(code) && code !== '000000'
  }

  const apiBase = getApiBase()
  if (import.meta.env.PROD && !apiBase) {
    // Fail closed in production when no backend is wired
    return false
  }

  try {
    const res = await fetch(`${apiBase}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    })
    return res.ok
  } catch (err) {
    console.error('Failed to verify OTP with server:', err)
    return false
  }
}

/**
 * Resend verification code (fails closed in PROD without backend)
 */
export async function resendVerificationCode(email: string): Promise<boolean> {
  const isMock = isMockMode()

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return true
  }

  const apiBase = getApiBase()
  if (import.meta.env.PROD && !apiBase) {
    return false
  }

  try {
    const res = await fetch(`${apiBase}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    return res.ok
  } catch {
    return false
  }
}
