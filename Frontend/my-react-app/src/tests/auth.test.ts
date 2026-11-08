import assert from 'node:assert'
import test from 'node:test'
import { emailSchema, validateEmail } from '../utils/authValidation.ts'

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
