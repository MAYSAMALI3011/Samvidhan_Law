import { apiClient } from '../client.ts'
import { isMockMode } from '../config.ts'
import type { MistakeReportPayload, NewsletterPayload } from '../types.ts'

export async function submitMistakeReport(payload: MistakeReportPayload): Promise<{ success: boolean; id: string }> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const reports = JSON.parse(localStorage.getItem('samvidhan-mistake-reports') || '[]')
    const id = `rep_${Date.now()}`
    reports.push({
      id,
      ...payload,
      status: 'New',
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem('samvidhan-mistake-reports', JSON.stringify(reports))
    return { success: true, id }
  }

  const res = await apiClient.post<{ success: boolean; id: string }>('/api/reports/mistake', payload)
  return res
}

export { submitContact } from './contactService.ts'

export async function subscribeNewsletter(payload: NewsletterPayload): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, message: 'Subscribed successfully to Gazette Briefing!' }
  }

  return apiClient.post<{ success: boolean; message: string }>('/api/newsletter/subscribe', payload)
}
