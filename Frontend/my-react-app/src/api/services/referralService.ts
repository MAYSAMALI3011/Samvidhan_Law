import { apiClient, createIdempotencyKey } from '../client.ts'
import { isMockMode } from '../config.ts'
import { referralStatsSchema, safeValidate } from '../schemas.ts'
import type { ReferralStats } from '../types.ts'
import { readJson } from '../../utils/storage.ts'
import type { DemoUser } from '../types.ts'

const defaultMilestones = [
  { milestone: 1, label: 'First Citizen Recruited', reward: '+50 XP & "Beacon" Badge', unlocked: true },
  { milestone: 3, label: 'Trio of Jurists', reward: '1 Month Free Pro Upgrade', unlocked: false },
  { milestone: 10, label: 'Constitutional Circle Leader', reward: 'Special Patron Profile Emblem', unlocked: false },
]

export async function getReferralStats(): Promise<ReferralStats> {
  if (isMockMode()) {
    const user = readJson<DemoUser | null>('user', null)
    const code = user?.name
      ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 6) + '2026'
      : 'CITIZEN2026'
    return {
      referralCode: code,
      invitesCount: 1,
      earnedXp: 50,
      milestones: defaultMilestones,
    }
  }

  const raw = await apiClient.get<unknown>('/api/referrals/me')
  return safeValidate(referralStatsSchema, raw, 'referralService.getReferralStats', {
    referralCode: 'CITIZEN2026',
    invitesCount: 0,
    earnedXp: 0,
    milestones: defaultMilestones,
  })
}

export async function applyReferralCode(
  code: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; bonusXp: number }> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, bonusXp: 25 }
  }

  const key = idempotencyKey || createIdempotencyKey()
  return apiClient.post<{ success: boolean; bonusXp: number }>(
    '/api/referrals/apply',
    { code: code.trim().toUpperCase() },
    { idempotencyKey: key },
  )
}
