import { getApiBaseUrl, getAuthStrategy, getAuthToken, isMockMode } from '../config'
import { streamMockChat } from '../../components/assistant/streaming/mockStreamer'
import type { StreamChunk } from '../types'

export interface ChatStreamOptions {
  conversationId?: string
  signal?: AbortSignal
  idleTimeoutMs?: number
}

/**
 * Async generator for streaming chat responses.
 * In mock mode: delegates to streamMockChat.
 * In live mode: opens an SSE stream via fetch to /api/assistant/chat.
 * Exempt from the standard 15s request timeout; uses a 30s idle timeout
 * (reset on every received chunk) plus user-triggered abort.
 */
export async function* streamChat(
  prompt: string,
  options: ChatStreamOptions = {},
): AsyncGenerator<StreamChunk, void, unknown> {
  if (isMockMode()) {
    yield* streamMockChat(prompt, options.signal)
    return
  }

  const base = getApiBaseUrl()
  const url = base ? `${base}/api/assistant/chat` : '/api/assistant/chat'
  const strategy = getAuthStrategy()
  const token = getAuthToken()
  const idleLimit = options.idleTimeoutMs ?? 30000

  const internalController = new AbortController()
  const onUserAbort = () => internalController.abort()
  if (options.signal) {
    if (options.signal.aborted) {
      return
    }
    options.signal.addEventListener('abort', onUserAbort)
  }

  let idleTimer: ReturnType<typeof setTimeout> | null = null
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      internalController.abort(new Error('Chat stream timed out: No data received for 30 seconds.'))
    }, idleLimit)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }

  if (strategy === 'bearer' && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  resetIdleTimer()

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        conversationId: options.conversationId,
      }),
      credentials: strategy === 'cookie' ? 'include' : 'same-origin',
      signal: internalController.signal,
    })
  } catch (err: unknown) {
    if (idleTimer) clearTimeout(idleTimer)
    if (options.signal) options.signal.removeEventListener('abort', onUserAbort)
    if (options.signal?.aborted) return
    throw err
  }

  if (!res.ok) {
    if (idleTimer) clearTimeout(idleTimer)
    if (options.signal) options.signal.removeEventListener('abort', onUserAbort)
    let errMsg = `Assistant error (${res.status})`
    try {
      const errJson = await res.json()
      if (errJson.message) errMsg = errJson.message
    } catch {
      // ignore
    }
    throw new Error(errMsg)
  }

  if (!res.body) {
    if (idleTimer) clearTimeout(idleTimer)
    if (options.signal) options.signal.removeEventListener('abort', onUserAbort)
    throw new Error('Readable stream not supported or empty response body.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (internalController.signal.aborted) {
        await reader.cancel()
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      // Reset idle timer on every incoming chunk
      resetIdleTimer()

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      // Keep unfinished part in buffer
      buffer = lines.pop() || ''

      for (const block of lines) {
        if (!block.trim()) continue

        let eventType = 'message'
        let dataStr = ''

        const blockLines = block.split('\n')
        for (const line of blockLines) {
          if (line.startsWith('event:')) {
            eventType = line.replace(/^event:\s*/, '').trim()
          } else if (line.startsWith('data:')) {
            dataStr = line.replace(/^data:\s*/, '').trim()
          }
        }

        if (!dataStr) continue

        try {
          const parsed = JSON.parse(dataStr)

          if (eventType === 'token' || parsed.token !== undefined) {
            yield { token: parsed.token || parsed }
          } else if (eventType === 'citation' || parsed.citation !== undefined) {
            yield { citation: parsed.citation || parsed }
          } else if (eventType === 'followUps' || parsed.followUps !== undefined) {
            yield { followUps: parsed.followUps || parsed }
          } else if (eventType === 'done' || parsed.done) {
            yield { done: true }
          } else if (eventType === 'error') {
            throw new Error(parsed.message || 'Stream error occurred.')
          }
        } catch (parseErr) {
          if (parseErr instanceof SyntaxError) {
            // Raw text fallback
            yield { token: dataStr }
          } else {
            throw parseErr
          }
        }
      }
    }
  } finally {
    if (idleTimer) clearTimeout(idleTimer)
    if (options.signal) options.signal.removeEventListener('abort', onUserAbort)
    reader.releaseLock()
  }
}
