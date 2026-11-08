/**
 * API Client Configuration
 *
 * Constraints:
 * 1. Mock mode is strictly impossible in PROD builds (import.meta.env.PROD forces live).
 * 2. Auth tokens prefer httpOnly secure cookies (credentials: 'include').
 *    Configurable authStrategy can switch to Bearer token if the backend requires it.
 *    No auth tokens are ever stored in localStorage.
 */

export type AuthStrategy = 'cookie' | 'bearer'

function getEnv(key: string, fallback = ''): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env[key] !== undefined) {
      return String(import.meta.env[key])
    }
  } catch {
    // ignore
  }
  return fallback
}

let currentAuthStrategy: AuthStrategy =
  (getEnv('VITE_AUTH_STRATEGY') as AuthStrategy) || 'cookie'

let inMemoryBearerToken: string | null = null

export function getAuthStrategy(): AuthStrategy {
  return currentAuthStrategy
}

export function setAuthStrategy(strategy: AuthStrategy): void {
  currentAuthStrategy = strategy
}

export function getAuthToken(): string | null {
  return inMemoryBearerToken
}

export function setAuthToken(token: string | null): void {
  inMemoryBearerToken = token
}

export function getApiBaseUrl(): string {
  const url = getEnv('VITE_API_URL')
  return url.replace(/\/$/, '')
}

/**
 * Returns true if mock mode is permitted.
 * In production builds (import.meta.env.PROD === true), mock mode is always FALSE.
 */
export function isMockMode(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.PROD) {
      return false
    }
  } catch {
    // ignore
  }
  return getEnv('VITE_USE_MOCKS', 'true') !== 'false'
}
