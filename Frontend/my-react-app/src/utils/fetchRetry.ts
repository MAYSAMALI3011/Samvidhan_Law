export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Executes an async operation with exponential backoff retry.
 * Handles temporary network glitches and server timeouts gracefully.
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 600, backoffFactor = 2, onRetry } = options

  let attempt = 0
  let delay = initialDelayMs

  while (true) {
    try {
      return await fn()
    } catch (err: unknown) {
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
