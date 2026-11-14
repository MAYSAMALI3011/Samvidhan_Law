export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: unknown) => boolean
}

/**
 * Executes an async operation with exponential backoff retry.
 * Handles temporary network glitches and server timeouts gracefully.
 * Never retries 4xx client errors (such as 401 Unauthorized or 400 Bad Request).
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 600, backoffFactor = 2, onRetry, shouldRetry } = options

  let attempt = 0
  let delay = initialDelayMs

  while (true) {
    try {
      return await fn()
    } catch (err: unknown) {
      // Do not retry 4xx errors (client errors: 400, 401, 403, 404, 409, 422, 429)
      const status = (err as { status?: number })?.status
      if (typeof status === 'number' && status >= 400 && status < 500) {
        throw err
      }

      if (shouldRetry && !shouldRetry(err)) {
        throw err
      }

      attempt++
      if (attempt > maxRetries) {
        throw err
      }

      if (onRetry) {
        onRetry(attempt, err instanceof Error ? err : new Error(String(err)))
      }

      // Jittered exponential delay
      const jitter = Math.random() * 200
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay *= backoffFactor
    }
  }
}
