import { apiClient, createIdempotencyKey } from '../client.ts'
import { isMockMode } from '../config.ts'
import {
  subscriptionPlanSchema,
  checkoutSessionResponseSchema,
  safeValidate,
} from '../schemas.ts'
import type { CheckoutSessionResponse, SubscriptionPlan } from '../types.ts'
import { readJson, writeJson } from '../../utils/storage.ts'
import type { DemoUser } from '../types.ts'

export async function getCurrentPlan(): Promise<SubscriptionPlan> {
  if (isMockMode()) {
    const user = readJson<DemoUser | null>('user', null)
    const tier = user?.tier || 'free'
    return {
      tier,
      status: 'active',
      validUntil: '2027-12-31',
      aiUsageToday: user?.aiUsageToday || 0,
      aiDailyLimit: tier === 'free' ? 5 : tier === 'pro' ? 50 : 9999,
    }
  }

  const raw = await apiClient.get<unknown>('/api/subscriptions/current')
  return safeValidate(subscriptionPlanSchema, raw, 'subscriptionService.getCurrentPlan')
}

export async function createCheckoutSession(
  tier: 'pro' | 'patron',
  idempotencyKey?: string,
): Promise<CheckoutSessionResponse> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 350))
    // In mock mode, simulate immediate tier grant in dev
    const user = readJson<DemoUser | null>('user', null)
    if (user) {
      writeJson('user', { ...user, tier })
    }
    return {
      success: true,
      message: `Demo upgrade to ${tier.toUpperCase()} activated successfully.`,
    }
  }

  const key = idempotencyKey || createIdempotencyKey()
  const raw = await apiClient.post<unknown>(
    '/api/subscriptions/checkout',
    { tier },
    { idempotencyKey: key },
  )
  return safeValidate(checkoutSessionResponseSchema, raw, 'subscriptionService.createCheckoutSession')
}

export async function cancelSubscription(idempotencyKey?: string): Promise<{ success: boolean }> {
  if (isMockMode()) {
    const user = readJson<DemoUser | null>('user', null)
    if (user) {
      writeJson('user', { ...user, tier: 'free' })
    }
    return { success: true }
  }

  const key = idempotencyKey || createIdempotencyKey()
  return apiClient.post<{ success: boolean }>(
    '/api/subscriptions/cancel',
    {},
    { idempotencyKey: key },
  )
}
