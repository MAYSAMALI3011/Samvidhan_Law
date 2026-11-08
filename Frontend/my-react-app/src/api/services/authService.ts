import { apiClient, ApiError } from '../client'
import { isMockMode, setAuthToken } from '../config'
import { authResponseSchema, safeValidate, userProfileSchema } from '../schemas'
import type { AuthSessionResponse, DemoUser } from '../types'

export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<AuthSessionResponse> {
  const email = credentials.email.trim().toLowerCase()

  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const derivedName = email.split('@')[0].replace(/[._-]/g, ' ')
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1)

    const mockUser: DemoUser = {
      id: `usr_${Date.now()}`,
      name: formattedName || 'Citizen Learner',
      email,
      interests: ['Constitutional Law', 'Citizen Rights'],
      role: 'learner',
      tier: 'free',
      aiUsageToday: 0,
    }

    return {
      success: true,
      user: mockUser,
      token: 'mock-jwt-session-token',
    }
  }

  // Live API call
  try {
    const raw = await apiClient.post<unknown>('/api/auth/login', {
      email,
      password: credentials.password,
    })

    const validated = safeValidate(authResponseSchema, raw, 'authService.loginUser')
    if (!validated.success || !validated.user) {
      throw new ApiError(validated.error || 'Authentication failed. Please check credentials.', 401)
    }

    if (validated.token) {
      setAuthToken(validated.token)
    }

    return {
      success: true,
      user: validated.user as DemoUser,
      token: validated.token,
    }
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Unable to connect to authentication server. Please try again.', 0)
  }
}

export async function signupUser(payload: {
  name: string
  email: string
  password: string
}): Promise<AuthSessionResponse> {
  const email = payload.email.trim().toLowerCase()

  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const mockUser: DemoUser = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      email,
      interests: ['Constitutional Law', 'Citizen Rights'],
      role: 'learner',
      tier: 'free',
      aiUsageToday: 0,
    }
    return {
      success: true,
      user: mockUser,
      token: 'mock-jwt-session-token',
    }
  }

  try {
    const raw = await apiClient.post<unknown>('/api/auth/signup', {
      name: payload.name.trim(),
      email,
      password: payload.password,
    })

    const validated = safeValidate(authResponseSchema, raw, 'authService.signupUser')
    if (!validated.success || !validated.user) {
      throw new ApiError(validated.error || 'Registration failed.', 400)
    }

    if (validated.token) {
      setAuthToken(validated.token)
    }

    return {
      success: true,
      user: validated.user as DemoUser,
      token: validated.token,
    }
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Registration service unavailable.', 0)
  }
}

export async function logoutUser(): Promise<void> {
  setAuthToken(null)
  if (isMockMode()) {
    return
  }

  try {
    await apiClient.post('/api/auth/logout', {})
  } catch {
    // Ignore network errors during logout
  }
}

export async function getCurrentUser(): Promise<DemoUser | null> {
  if (isMockMode()) {
    return null
  }

  try {
    const raw = await apiClient.get<unknown>('/api/auth/me')
    const user = safeValidate(userProfileSchema, raw, 'authService.getCurrentUser')
    return user as DemoUser
  } catch {
    return null
  }
}

export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    return /^\d{6}$/.test(code) && code !== '000000'
  }

  try {
    const res = await apiClient.post<{ success: boolean }>('/api/auth/verify-otp', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    })
    return Boolean(res?.success)
  } catch {
    return false
  }
}

export async function resendVerificationCode(email: string): Promise<boolean> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 350))
    return true
  }

  try {
    const res = await apiClient.post<{ success: boolean }>('/api/auth/resend-otp', {
      email: email.trim().toLowerCase(),
    })
    return Boolean(res?.success)
  } catch {
    return false
  }
}

export async function forgotPassword(email: string): Promise<boolean> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return true
  }

  try {
    const res = await apiClient.post<{ success: boolean }>('/api/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    })
    return Boolean(res?.success)
  } catch {
    return false
  }
}

export async function resetPassword(payload: {
  token: string
  newPassword: string
}): Promise<boolean> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return true
  }

  try {
    const res = await apiClient.post<{ success: boolean }>('/api/auth/reset-password', payload)
    return Boolean(res?.success)
  } catch {
    return false
  }
}
