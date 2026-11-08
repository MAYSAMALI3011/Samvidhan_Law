import assert from 'node:assert'
import test from 'node:test'
import { scorePassword, emailSuggestion } from '../components/ui/textFieldLogic.ts'

test('scorePassword: empty, null, and short passwords', () => {
  assert.strictEqual(scorePassword(''), 0)
  assert.strictEqual(scorePassword(null), 0)
  assert.strictEqual(scorePassword(undefined), 0)
  // Short password (< 8 chars, lowercase only) has length > 0 so returns 1
  assert.strictEqual(scorePassword('abc'), 1)
})

test('scorePassword: scoring criteria and progression', () => {
  // length >= 8 -> s=1
  assert.strictEqual(scorePassword('abcdefgh'), 1)

  // length >= 8 (s=1) + mixed case (s=2)
  assert.strictEqual(scorePassword('Abcdefgh'), 2)

  // length >= 8 (s=1) + mixed case (s=2) + digit (s=3) -> Good
  assert.strictEqual(scorePassword('Abcdefg1'), 3)

  // length >= 10 with symbol + digit + mixed case -> s=4 -> Strong
  assert.strictEqual(scorePassword('Abcdefg1!#'), 4)
})

test('scorePassword: caps common weak passwords to 1', () => {
  assert.strictEqual(scorePassword('password123'), 1)
  assert.strictEqual(scorePassword('12345678'), 1)
  assert.strictEqual(scorePassword('qwerty12345'), 1)
})

test('emailSuggestion: matches common domains after @', () => {
  assert.strictEqual(emailSuggestion('citizen@gm'), 'citizen@gmail.com')
  assert.strictEqual(emailSuggestion('advocate@out'), 'advocate@outlook.com')
  assert.strictEqual(emailSuggestion('scholar@yah'), 'scholar@yahoo.com')
  assert.strictEqual(emailSuggestion('user@hot'), 'user@hotmail.com')
  assert.strictEqual(emailSuggestion('legal@ic'), 'legal@icloud.com')
})

test('emailSuggestion: returns empty string when invalid or already completed', () => {
  assert.strictEqual(emailSuggestion(''), '')
  assert.strictEqual(emailSuggestion(null), '')
  assert.strictEqual(emailSuggestion('citizen'), '')
  assert.strictEqual(emailSuggestion('citizen@gmail.com'), '')
  assert.strictEqual(emailSuggestion('user@outlook.com'), '')
  assert.strictEqual(emailSuggestion('citizen@notadomain'), '')
})
