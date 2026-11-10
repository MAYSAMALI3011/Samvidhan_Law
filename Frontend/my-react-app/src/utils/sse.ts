import type { StreamChunk } from '../api/types.ts'

/**
 * Parses a single Server-Sent Events (SSE) block into a StreamChunk.
 */
export function parseSSEBlock(block: string): StreamChunk | null {
  if (!block.trim()) return null

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

  if (!dataStr) return null

  try {
    const parsed = JSON.parse(dataStr)

    if (eventType === 'token' || parsed.token !== undefined) {
      return { token: parsed.token || parsed }
    } else if (eventType === 'citation' || parsed.citation !== undefined) {
      return { citation: parsed.citation || parsed }
    } else if (eventType === 'followUps' || parsed.followUps !== undefined) {
      return { followUps: parsed.followUps || parsed }
    } else if (eventType === 'done' || parsed.done) {
      return { done: true, conversationId: parsed.conversationId }
    } else if (eventType === 'error') {
      throw new Error(parsed.message || 'Stream error occurred.')
    }
    return null
  } catch (parseErr) {
    if (parseErr instanceof SyntaxError) {
      // Raw text fallback
      return { token: dataStr }
    }
    throw parseErr
  }
}
