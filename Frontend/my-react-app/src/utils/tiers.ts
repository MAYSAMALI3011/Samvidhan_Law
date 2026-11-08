import { readJson, writeJson } from './storage.ts'
import type { UserTier } from '../types'

export type { UserTier }

export type FeatureKey =
  | 'unlimited-ai'
  | 'advanced-acts'
  | 'export-notes'
  | 'audio-offline'
  | 'mock-court'
  | 'custom-study-tracks'

export interface TierConfig {
  name: string
  label: string
  dailyAiLimit: number
  price: string
  features: FeatureKey[]
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    name: 'Citizen Free',
    label: 'Free',
    dailyAiLimit: 5,
    price: '0',
    features: ['export-notes'],
  },
  pro: {
    name: 'Samvidhan Pro',
    label: 'PRO',
    dailyAiLimit: 9999,
    price: '₹299/mo',
    features: [
      'unlimited-ai',
      'advanced-acts',
      'export-notes',
      'audio-offline',
      'mock-court',
      'custom-study-tracks',
    ],
  },
  patron: {
    name: 'Founding Patron',
    label: 'PATRON',
    dailyAiLimit: 9999,
    price: '₹999/yr',
    features: [
      'unlimited-ai',
      'advanced-acts',
      'export-notes',
      'audio-offline',
      'mock-court',
      'custom-study-tracks',
    ],
  },
}

/**
 * Resolves current user tier from session state or active session storage.
 */
export function getCurrentTier(userTier?: UserTier): UserTier {
  if (userTier) return userTier
  try {
    const user = readJson<{ tier?: UserTier } | null>('user', null)
    return user?.tier || 'free'
  } catch {
    return 'free'
  }
}

/**
 * Updates user tier in session state and notifies subscribers.
 */
export function setUserTier(tier: UserTier) {
  try {
    const user = readJson<Record<string, unknown> | null>('user', null)
    if (user) {
      user.tier = tier
      writeJson('user', user)
    }
    window.dispatchEvent(new CustomEvent('samvidhan:tier-changed', { detail: { tier } }))
  } catch {}
}

export function hasFeature(feature: FeatureKey, tier: UserTier = getCurrentTier()): boolean {
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.free
  return config.features.includes(feature)
}

export function getAiDailyLimit(tier: UserTier = getCurrentTier()): number {
  return TIER_CONFIGS[tier]?.dailyAiLimit ?? 5
}

/**
 * Calculates daily AI usage against tier limit.
 * Defaults to 0 used (no fake demonstration count).
 */
export function getAiDailyUsage(
  tier: UserTier = getCurrentTier(),
  currentUsed?: number,
): { used: number; limit: number; remaining: number } {
  const limit = getAiDailyLimit(tier)
  let used = typeof currentUsed === 'number' ? currentUsed : 0

  if (typeof currentUsed !== 'number') {
    try {
      const user = readJson<{ aiUsageToday?: number } | null>('user', null)
      used = user?.aiUsageToday ?? 0
    } catch {
      used = 0
    }
  }

  const remaining = Math.max(0, limit - used)
  return { used, limit, remaining }
}

/**
 * Increments AI daily usage in session state.
 */
export function incrementAiDailyUsage(): number {
  let next = 1
  try {
    const user = readJson<Record<string, unknown> | null>('user', null)
    if (user) {
      const current = typeof user.aiUsageToday === 'number' ? user.aiUsageToday : 0
      next = current + 1
      user.aiUsageToday = next
      writeJson('user', user)
    }
    window.dispatchEvent(new CustomEvent('samvidhan:ai-usage-changed', { detail: { used: next } }))
  } catch {}
  return next
}
