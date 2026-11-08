import assert from 'node:assert'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  resolveMorMood,
  getMorAriaLabel,
  shouldRenderMor,
  getMorWrapperClasses,
} from '../components/mascot/morLogic.ts'
import { morQueue } from '../components/mascot/morQueue.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('shouldRenderMor: returns false when setting or prop is disabled', () => {
  // Settings toggle "Show guide character" is off
  assert.strictEqual(shouldRenderMor(false, undefined), false)
  // Direct prop enabled is false
  assert.strictEqual(shouldRenderMor(true, false), false)
  assert.strictEqual(shouldRenderMor(undefined, false), false)
  // When enabled
  assert.strictEqual(shouldRenderMor(true, true), true)
  assert.strictEqual(shouldRenderMor(true, undefined), true)
  assert.strictEqual(shouldRenderMor(undefined, undefined), true)
})

test('getMorAriaLabel: mood prop dynamically updates accessible aria-label', () => {
  const moods = ['wave', 'reading', 'celebrate', 'thinking', 'encourage', 'sleepy', 'idle'] as const

  for (const mood of moods) {
    const label = getMorAriaLabel(mood)
    assert.strictEqual(label, `Mor the peacock, ${mood}`)
  }

  // Backward compatibility alias: 'waving' -> 'wave', 'standing' -> 'idle'
  assert.strictEqual(getMorAriaLabel('waving'), 'Mor the peacock, wave')
  assert.strictEqual(getMorAriaLabel('standing'), 'Mor the peacock, idle')

  // Custom aria-label overrides default
  assert.strictEqual(
    getMorAriaLabel('celebrate', false, 'Mor congratulating user on quiz victory'),
    'Mor congratulating user on quiz victory'
  )
})

test('getMorAriaLabel: decorative={true} returns undefined (omits aria-label)', () => {
  const label = getMorAriaLabel('celebrate', true)
  assert.strictEqual(label, undefined, 'Decorative mascot must return undefined to omit aria-label')
})

test('getMorWrapperClasses: toggles is-animated and is-static classes based on animate prop', () => {
  const animated = getMorWrapperClasses('celebrate', true, 'extra-class')
  assert.ok(animated.includes('is-animated'), 'Should contain is-animated class')
  assert.ok(!animated.includes('is-static'), 'Should not contain is-static class')
  assert.ok(animated.includes('mood-celebrate'), 'Should include mood class')
  assert.ok(animated.includes('extra-class'), 'Should preserve additional classNames')

  const staticClass = getMorWrapperClasses('celebrate', false)
  assert.ok(staticClass.includes('is-static'), 'Should contain is-static class')
  assert.ok(!staticClass.includes('is-animated'), 'Should not contain is-animated class')
})

test('mor.css includes prefers-reduced-motion and data-reduced-motion rules', () => {
  const cssPath = path.resolve(__dirname, '../components/mascot/mor.css')
  const cssContent = fs.readFileSync(cssPath, 'utf8')

  assert.ok(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'mor.css must contain prefers-reduced-motion media query'
  )
  assert.ok(
    cssContent.includes('[data-reduced-motion="true"]'),
    'mor.css must contain [data-reduced-motion="true"] selector'
  )
  assert.ok(
    cssContent.includes('animation: none !important'),
    'mor.css must disable all animations under reduced motion'
  )
})

test('morQueue: manages single active speech bubble, notifies subscribers, and dismisses', () => {
  let latestMsg: { id: string; text: string } | null = null
  const unsub = morQueue.subscribe((msg) => {
    latestMsg = msg
  })

  morQueue.say({
    id: 'test-msg-1',
    text: 'Nice work! Article 14 done.',
    mood: 'encourage',
    durationMs: 0,
  })

  assert.ok(latestMsg !== null)
  assert.strictEqual(latestMsg.text, 'Nice work! Article 14 done.')

  morQueue.dismiss()
  assert.strictEqual(latestMsg, null)
  unsub()
})
