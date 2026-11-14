import assert from 'node:assert'
import test from 'node:test'
import { emailSchema, validateEmail } from '../utils/authValidation.ts'
import { retryAsync } from '../utils/fetchRetry.ts'

test('shared emailSchema regression: accepts valid emails and rejects invalid patterns', () => {
  // Valid emails that were previously broken or common in Indian universities
  assert.strictEqual(emailSchema.safeParse('sharma@gmail.com').success, true, 'sharma@gmail.com must be accepted')
  assert.strictEqual(emailSchema.safeParse('students@college.ac.in').success, true, 'students@college.ac.in must be accepted')
  assert.strictEqual(emailSchema.safeParse('citizen.samvidhan@gov.in').success, true, 'citizen.samvidhan@gov.in must be accepted')

  // Invalid email patterns
  assert.strictEqual(emailSchema.safeParse('a@b').success, false, '"a@b" must be rejected')
  assert.strictEqual(emailSchema.safeParse('a b@c.com').success, false, '"a b@c.com" must be rejected')
  assert.strictEqual(emailSchema.safeParse('@x.com').success, false, '"@x.com" must be rejected')
  assert.strictEqual(emailSchema.safeParse('not-an-email').success, false, '"not-an-email" must be rejected')
  assert.strictEqual(emailSchema.safeParse('').success, false, 'Empty string must be rejected')

  // validateEmail helper returns null on valid and an error string on invalid
  assert.strictEqual(validateEmail('sharma@gmail.com'), null)
  assert.strictEqual(validateEmail('students@college.ac.in'), null)
  assert.ok(typeof validateEmail('a@b') === 'string', 'validateEmail must return error message for a@b')
  assert.ok(typeof validateEmail('a b@c.com') === 'string', 'validateEmail must return error message for a b@c.com')
  assert.ok(typeof validateEmail('@x.com') === 'string', 'validateEmail must return error message for @x.com')
})

test('retryAsync regression: immediately throws on 401 and 4xx without retrying', async () => {
  let callCount = 0
  const error401 = Object.assign(new Error('Unauthorized'), { status: 401 })

  await assert.rejects(
    async () => {
      await retryAsync(
        async () => {
          callCount++
          throw error401
        },
        { maxRetries: 3, initialDelayMs: 10 }
      )
    },
    (err: unknown) => {
      assert.strictEqual((err as { status: number }).status, 401)
      return true
    }
  )

  // Critical requirement: MUST NOT RETRY 401
  assert.strictEqual(callCount, 1, 'retryAsync must execute exactly once on 401 (0 retries)')
})

test('retryAsync regression: retries on 500 server error and eventually throws', async () => {
  let callCount = 0
  const error500 = Object.assign(new Error('Internal Server Error'), { status: 500 })

  await assert.rejects(
    async () => {
      await retryAsync(
        async () => {
          callCount++
          throw error500
        },
        { maxRetries: 2, initialDelayMs: 10 }
      )
    },
    (err: unknown) => {
      assert.strictEqual((err as { status: number }).status, 500)
      return true
    }
  )

  assert.strictEqual(callCount, 3, 'retryAsync must retry 500 errors (1 initial + 2 retries = 3 calls)')
})
