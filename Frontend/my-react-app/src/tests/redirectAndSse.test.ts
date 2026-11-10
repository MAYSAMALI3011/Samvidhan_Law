import assert from 'node:assert'
import test from 'node:test'
import { sanitizeReturnUrl, isValidCheckoutUrl } from '../utils/redirect.ts'
import { parseSSEBlock } from '../utils/sse.ts'

test('redirect sanitizer: rejects open-redirect vectors and allows safe relative paths', () => {
  // Attack vectors that must be rejected
  assert.strictEqual(sanitizeReturnUrl('//evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('https://evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('http://evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('/\\evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('/\\/evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('javascript:alert(1)'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('data:text/html,<script>alert(1)</script>'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('///evil.com'), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl(''), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl('   '), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl(null), '/dashboard')
  assert.strictEqual(sanitizeReturnUrl(undefined), '/dashboard')

  // Custom fallback support
  assert.strictEqual(sanitizeReturnUrl('//evil.com', '/learn'), '/learn')

  // Valid relative paths that must be accepted
  assert.strictEqual(sanitizeReturnUrl('/admin'), '/admin')
  assert.strictEqual(sanitizeReturnUrl('/learn/constitution'), '/learn/constitution')
  assert.strictEqual(sanitizeReturnUrl('/learn?step=2&tab=overview'), '/learn?step=2&tab=overview')
  assert.strictEqual(sanitizeReturnUrl('/dashboard#streak'), '/dashboard#streak')
})

test('checkout URL validator: allows approved payment gateways and same-origin paths, rejects arbitrary URLs', () => {
  // Approved checkout domains
  assert.strictEqual(isValidCheckoutUrl('https://checkout.stripe.com/c/pay/cs_live_123'), true)
  assert.strictEqual(isValidCheckoutUrl('https://api.razorpay.com/v1/checkout/session_456'), true)
  assert.strictEqual(isValidCheckoutUrl('/checkout/mock-success'), true)

  // Unapproved or insecure destinations
  assert.strictEqual(isValidCheckoutUrl('http://checkout.stripe.com/pay'), false) // insecure http
  assert.strictEqual(isValidCheckoutUrl('https://evil-stripe.com/pay'), false)
  assert.strictEqual(isValidCheckoutUrl('https://attacker.com'), false)
  assert.strictEqual(isValidCheckoutUrl('javascript:void(0)'), false)
  assert.strictEqual(isValidCheckoutUrl(''), false)
  assert.strictEqual(isValidCheckoutUrl(null), false)
  assert.strictEqual(isValidCheckoutUrl(undefined), false)
})

test('parseSSEBlock: parses token, citation, followUps, and done event with conversationId', () => {
  // Done event with conversationId
  const doneBlock = 'event: done\ndata: {"done":true,"conversationId":"conv_991823"}'
  const doneChunk = parseSSEBlock(doneBlock)
  assert.deepStrictEqual(doneChunk, { done: true, conversationId: 'conv_991823' })

  // Done event without conversationId
  const simpleDoneBlock = 'event: done\ndata: {"done":true}'
  assert.deepStrictEqual(parseSSEBlock(simpleDoneBlock), { done: true, conversationId: undefined })

  // Token event
  const tokenBlock = 'event: token\ndata: {"token":"Article 21 protects life."}'
  assert.deepStrictEqual(parseSSEBlock(tokenBlock), { token: 'Article 21 protects life.' })

  // Citation event
  const citationBlock = 'event: citation\ndata: {"citation":{"label":"Maneka Gandhi v. UOI","url":"/library/art21","summary":"Fair procedure."}}'
  assert.deepStrictEqual(parseSSEBlock(citationBlock), {
    citation: { label: 'Maneka Gandhi v. UOI', url: '/library/art21', summary: 'Fair procedure.' }
  })

  // Empty or whitespace block
  assert.strictEqual(parseSSEBlock('   \n\n   '), null)
})
