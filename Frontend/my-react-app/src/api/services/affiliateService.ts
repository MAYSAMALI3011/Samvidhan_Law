import { apiClient, createIdempotencyKey } from '../client.ts'
import { isMockMode } from '../config.ts'
import { affiliateStatsSchema, safeValidate } from '../schemas.ts'
import type { AffiliateApplicationPayload, AffiliateStats } from '../types.ts'

export async function getAffiliateStats(): Promise<AffiliateStats> {
  if (isMockMode()) {
    return {
      clicks: 42,
      conversions: 8,
      earnings: 2400,
      payoutStatus: 'Active (Next payout 1st of month)',
    }
  }

  const raw = await apiClient.get<unknown>('/api/affiliates/stats')
  return safeValidate(affiliateStatsSchema, raw, 'affiliateService.getAffiliateStats', {
    clicks: 0,
    conversions: 0,
    earnings: 0,
    payoutStatus: 'Pending',
  })
}

export async function applyAffiliate(
  payload: AffiliateApplicationPayload,
  idempotencyKey?: string,
): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 350))
    return {
      success: true,
      message: 'Affiliate application submitted! Our team will contact you within 48 hours.',
    }
  }

  const key = idempotencyKey || createIdempotencyKey()
  return apiClient.post<{ success: boolean; message: string }>(
    '/api/affiliates/apply',
    payload,
    { idempotencyKey: key },
  )
}
