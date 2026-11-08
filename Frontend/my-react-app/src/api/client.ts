import { getApiBaseUrl, getAuthStrategy, getAuthToken, setAuthToken } from './config.ts'
import { retryAsync } from '../utils/fetchRetry.ts'

export class ApiError extends Error {
  public status: number
  public details?: unknown
  public isValidationError?: boolean
  public isNetworkError?: boolean

  constructor(message: string, status = 500, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
  params?: Record<string, string | number | boolean | undefined>
  timeoutMs?: number
  retry?: boolean
  skipAuth?: boolean
}

/**
 * Dispatches 401 Unauthorized event to let the auth layer react
 */
function handleUnauthorized(): void {
  setAuthToken(null)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('samvidhan:unauthorized'))
  }
}

/**
 * Builds full request URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = base ? `${base}${cleanEndpoint}` : cleanEndpoint

  if (!params) return fullUrl

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  }

  const queryString = query.toString()
  return queryString ? `${fullUrl}?${queryString}` : fullUrl
}

/**
 * Core HTTP Request Execution
 */
async function executeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers: customHeaders = {},
    body,
    params,
    timeoutMs = 15000,
    skipAuth = false,
    ...rest
  } = options

  const url = buildUrl(endpoint, params)
  const strategy = getAuthStrategy()
  const token = getAuthToken()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  // Attach Content-Type for JSON payloads
  if (body !== undefined && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers['Content-Type'] = 'application/json'
  }

  // Strategy 1: Bearer token (if strategy is set to bearer and token exists)
  if (!skipAuth && strategy === 'bearer' && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Setup timeout via AbortController
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined && typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body,
      credentials: strategy === 'cookie' ? 'include' : 'same-origin',
      signal: options.signal || controller.signal,
      ...rest,
    })

    clearTimeout(timer)

    if (res.status === 401) {
      handleUnauthorized()
      throw new ApiError('Session expired or unauthorized. Please log in again.', 401)
    }

    if (!res.ok) {
      let errorBody: { message?: string; errors?: unknown } = {}
      try {
        errorBody = await res.json()
      } catch {
        // Fall back to status text
      }

      const message = errorBody.message || `Request failed with status ${res.status}: ${res.statusText}`
      throw new ApiError(message, res.status, errorBody.errors)
    }

    // 204 No Content
    if (res.status === 204) {
      return undefined as unknown as T
    }

    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T
    }

    return (await res.text()) as unknown as T
  } catch (err: unknown) {
    clearTimeout(timer)

    if (err instanceof ApiError) {
      throw err
    }

    const isAbort = (err as Error)?.name === 'AbortError'
    const networkErr = new ApiError(
      isAbort ? 'Request timed out. Please try again.' : 'Network connection failure.',
      isAbort ? 408 : 0,
    )
    networkErr.isNetworkError = true
    throw networkErr
  }
}

/**
 * Public Typed API Client
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    const isRetryable = options?.retry !== false
    if (isRetryable) {
      return retryAsync(() => executeRequest<T>(endpoint, { ...options, method: 'GET' }), {
        maxRetries: 2,
        initialDelayMs: 250,
      })
    }
    return executeRequest<T>(endpoint, { ...options, method: 'GET' })
  },

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
    return executeRequest<T>(endpoint, { ...options, method: 'POST', body })
  },

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
    return executeRequest<T>(endpoint, { ...options, method: 'PUT', body })
  },

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
    return executeRequest<T>(endpoint, { ...options, method: 'PATCH', body })
  },

  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return executeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  },
}
