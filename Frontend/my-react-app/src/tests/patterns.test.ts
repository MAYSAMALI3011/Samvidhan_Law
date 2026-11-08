import assert from 'node:assert'
import test from 'node:test'
import { detectEmailTypo, calculatePasswordStrength } from '../ui/forms/useSmartValidation.ts'
import { hasFeature, getAiDailyLimit } from '../utils/tiers.ts'
import { retryAsync } from '../utils/fetchRetry.ts'

test('detectEmailTypo identifies common mistyped domains', () => {
  assert.strictEqual(detectEmailTypo('citizen@gmial.com'), 'citizen@gmail.com')
  assert.strictEqual(detectEmailTypo('user@gamil.com'), 'user@gmail.com')
  assert.strictEqual(detectEmailTypo('advocate@outlok.com'), 'advocate@outlook.com')
  assert.strictEqual(detectEmailTypo('valid@gmail.com'), null)
  assert.strictEqual(detectEmailTypo('not-an-email'), null)
})

test('calculatePasswordStrength scores length and complexity', () => {
  assert.strictEqual(calculatePasswordStrength('').score, 0)
  assert.strictEqual(calculatePasswordStrength('abc').score, 0)
  assert.strictEqual(calculatePasswordStrength('abcdefgh').score, 1)
  assert.strictEqual(calculatePasswordStrength('Abcdefgh').score, 2)
  assert.strictEqual(calculatePasswordStrength('Abcdefg1').score, 3)
  assert.strictEqual(calculatePasswordStrength('Abcdefg1!').score, 4)
  assert.strictEqual(calculatePasswordStrength('Abcdefg1!').label, 'Very Strong')
})

test('tier system restricts features correctly', () => {
  assert.strictEqual(hasFeature('unlimited-ai', 'free'), false)
  assert.strictEqual(hasFeature('unlimited-ai', 'pro'), true)
  assert.strictEqual(hasFeature('advanced-acts', 'pro'), true)
  assert.strictEqual(getAiDailyLimit('free'), 5)
  assert.strictEqual(getAiDailyLimit('pro'), 9999)
})

test('retryAsync succeeds after transient failures', async () => {
  let attempts = 0
  const result = await retryAsync(
    async () => {
      attempts++
      if (attempts < 2) throw new Error('Network timeout')
      return 'SUCCESS'
    },
    { maxRetries: 3, initialDelayMs: 20 }
  )

  assert.strictEqual(result, 'SUCCESS')
  assert.strictEqual(attempts, 2)
})
