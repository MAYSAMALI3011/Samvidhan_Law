import { z } from 'zod'
import { apiClient } from '../client.ts'
import { isMockMode } from '../config.ts'
import { askConversationSchema, safeValidate } from '../schemas.ts'
import type { AskConversation } from '../types.ts'

export async function listConversations(): Promise<AskConversation[]> {
  if (isMockMode()) {
    try {
      const raw = localStorage.getItem('samvidhan-chat-conversations')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const raw = await apiClient.get<unknown>('/api/assistant/conversations')
  return safeValidate(z.array(askConversationSchema), raw, 'assistantConversations.list', []) as AskConversation[]
}

export async function getConversation(id: string): Promise<AskConversation | undefined> {
  if (isMockMode()) {
    const list = await listConversations()
    return list.find((c) => c.id === id)
  }

  try {
    const raw = await apiClient.get<unknown>(`/api/assistant/conversations/${encodeURIComponent(id)}`)
    return safeValidate(askConversationSchema, raw, `assistantConversations.get:${id}`) as AskConversation
  } catch {
    return undefined
  }
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  if (isMockMode()) {
    const list = await listConversations()
    const updated = list.filter((c) => c.id !== id)
    localStorage.setItem('samvidhan-chat-conversations', JSON.stringify(updated))
    return { success: true }
  }

  return apiClient.delete<{ success: boolean }>(`/api/assistant/conversations/${encodeURIComponent(id)}`)
}
