import { apiClient } from '../client.ts'
import { isMockMode } from '../config.ts'
import type { ContactPayload } from '../types.ts'

export async function submitContact(payload: ContactPayload): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 350))
    return {
      success: true,
      message: 'Thank you! Your inquiry has been received by our curriculum team.',
    }
  }

  const res = await apiClient.post<{ success: boolean; message?: string }>('/api/contact', payload)
  return {
    success: res.success,
    message: res.message || 'Your inquiry has been submitted.',
  }
}
