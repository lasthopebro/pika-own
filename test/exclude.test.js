import test from 'node:test'
import assert from 'node:assert/strict'
import { isExcluded } from '../lib/logic.js'

test('isExcluded: Domain, Unterdomain, Groß/Klein, Leerzeilen; ähnliche Namen nicht', () => {
  assert.equal(isExcluded('bank.de', 'Bank.de, mail.com'), true)
  assert.equal(isExcluded('www.mail.com', 'bank.de, mail.com'), true)
  assert.equal(isExcluded('notbank.de', 'bank.de'), false)
  assert.equal(isExcluded('a.com', ''), false)
  assert.equal(isExcluded('a.com', ' , '), false)
})