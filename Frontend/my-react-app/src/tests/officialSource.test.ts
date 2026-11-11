import test from 'node:test'
import assert from 'node:assert/strict'
import { isOfficialSourceUrl, OFFICIAL_SOURCE_DOMAINS } from '../utils/officialSource.ts'

test('OFFICIAL_SOURCE_DOMAINS contains approved Indian government/legislative domains', () => {
  assert.deepEqual(OFFICIAL_SOURCE_DOMAINS, ['gov.in', 'nic.in', 'sansad.in'])
})

test('isOfficialSourceUrl: accepts valid official https URLs', () => {
  assert.equal(isOfficialSourceUrl('https://legislative.gov.in/constitution-of-india'), true)
  assert.equal(isOfficialSourceUrl('https://indiacode.nic.in/handle/123456789/1362'), true)
  assert.equal(isOfficialSourceUrl('https://sansad.in/rs/legislation/bills'), true)
  assert.equal(isOfficialSourceUrl('https://main.sci.gov.in/judgments'), true)
  assert.equal(isOfficialSourceUrl('https://sub.portal.gov.in/act?id=123#sec1'), true)
  assert.equal(isOfficialSourceUrl('https://gov.in/'), true)
})

test('isOfficialSourceUrl: rejects non-https protocols', () => {
  assert.equal(isOfficialSourceUrl('http://legislative.gov.in/constitution'), false)
  assert.equal(isOfficialSourceUrl('ftp://sansad.in/doc.pdf'), false)
  assert.equal(isOfficialSourceUrl('javascript:alert(1)'), false)
})

test('isOfficialSourceUrl: rejects domain spoofing and look-alikes', () => {
  assert.equal(isOfficialSourceUrl('https://gov.in.attacker.org/phish'), false)
  assert.equal(isOfficialSourceUrl('https://evilgov.in/page'), false)
  assert.equal(isOfficialSourceUrl('https://fakensansad.in/doc'), false)
  assert.equal(isOfficialSourceUrl('https://notnic.in/act'), false)
  assert.equal(isOfficialSourceUrl('https://indiacode.nic.in.com/act'), false)
})

test('isOfficialSourceUrl: rejects embedded credentials', () => {
  assert.equal(isOfficialSourceUrl('https://admin:secret@sansad.in/bills'), false)
  assert.equal(isOfficialSourceUrl('https://user@legislative.gov.in/act'), false)
})

test('isOfficialSourceUrl: rejects invalid inputs safely', () => {
  assert.equal(isOfficialSourceUrl(''), false)
  assert.equal(isOfficialSourceUrl('   '), false)
  // @ts-expect-error test invalid types
  assert.equal(isOfficialSourceUrl(null), false)
  // @ts-expect-error test invalid types
  assert.equal(isOfficialSourceUrl(undefined), false)
  assert.equal(isOfficialSourceUrl('not a url'), false)
})
