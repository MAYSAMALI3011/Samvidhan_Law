import { getApiBaseUrl, getAuthStrategy, getAuthToken, isMockMode } from '../config'
import { streamMockChat } from '../../components/assistant/streaming/mockStreamer'
import type { StreamChunk } from '../types'

export interface ChatStreamOptions {
  conversationId?: string
  signal?: AbortSignal
}

/**
 * Async generator for streaming chat responses.
 * In mock mode: delegates to streamMockChat.
 * In live mode: opens an SSE stream via fetch to /api/assistant/chat and parses event messages.
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }

  if (strategy === 'bearer' && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      conversationId: options.conversationId,
    }),
    credentials: strategy === 'cookie' ? 'include' : 'same-origin',
    signal: options.signal,
  })

  if (!res.ok) {
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
    throw new Error('Readable stream not supported or empty response body.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (options.signal?.aborted) {
        await reader.cancel()
        break
      }

      const { done, value } = await reader.read()
      if (done) break

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
    reader.releaseLock()
  }
}
