import { apiClient, createIdempotencyKey } from '../client.ts'
import { isMockMode } from '../config.ts'
import { userProfileSchema, userSettingsSchema, safeValidate } from '../schemas.ts'
import type { DemoUser, UserSettings } from '../types.ts'
import { readJson, removeKey, writeJson } from '../../utils/storage.ts'

export async function getProfile(): Promise<DemoUser | null> {
  if (isMockMode()) {
    return readJson<DemoUser | null>('user', null)
  }
  try {
    const raw = await apiClient.get<unknown>('/api/user/profile')
    return safeValidate(userProfileSchema, raw, 'userService.getProfile') as DemoUser
  } catch {
    return null
  }
}

export async function updateProfile(data: { name?: string; interests?: string[] }): Promise<DemoUser> {
  if (isMockMode()) {
    const current = readJson<DemoUser | null>('user', null)
    const updated: DemoUser = {
      id: current?.id || `usr_${Date.now()}`,
      name: data.name ?? current?.name ?? 'Citizen Learner',
      email: current?.email ?? 'citizen@example.in',
      interests: data.interests ?? current?.interests ?? [],
      role: current?.role ?? 'learner',
      tier: current?.tier ?? 'free',
      aiUsageToday: current?.aiUsageToday ?? 0,
    }
    writeJson('user', updated)
    return updated
  }

  const raw = await apiClient.patch<unknown>('/api/user/profile', data)
  return safeValidate(userProfileSchema, raw, 'userService.updateProfile') as DemoUser
}

export async function updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
  if (isMockMode()) {
    const current = readJson<UserSettings>('user-settings', {
      dailyGoal: 30,
      soundEnabled: true,
      mascotEnabled: true,
      reduceMotion: false,
      compact: false,
    })
    const updated = { ...current, ...data }
    writeJson('user-settings', updated)
    return updated
  }

  const raw = await apiClient.patch<unknown>('/api/user/settings', data)
  return safeValidate(userSettingsSchema, raw, 'userService.updateSettings')
}

export async function exportUserData(): Promise<Record<string, unknown>> {
  if (isMockMode()) {
    return {
      user: readJson('user', null),
      progress: readJson('progress', null),
      settings: readJson('user-settings', null),
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0',
    }
  }

  return apiClient.get<Record<string, unknown>>('/api/user/export')
}

export async function deleteAccount(idempotencyKey?: string): Promise<{ success: boolean }> {
  if (isMockMode()) {
    removeKey('user')
    removeKey('progress')
    removeKey('user-settings')
    return { success: true }
  }

  const key = idempotencyKey || createIdempotencyKey()
  return apiClient.delete<{ success: boolean }>('/api/user/account', { idempotencyKey: key })
}
