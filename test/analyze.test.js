import test from 'node:test'
import assert from 'node:assert/strict'
import { REPO_RE, licenseClass } from '../tools/analyze_repo.mjs'

test('REPO_RE nimmt nur echte GitHub-Repo-URLs', () => {
  assert.ok(REPO_RE.test('https://github.com/Fannon/Tab-Session-Manager'))
  assert.ok(REPO_RE.test('https://github.com/a/b.git'))
  for (const u of ['http://github.com/a/b', 'https://evil.com/github.com/a/b', 'https://github.com/a/b/../../x', 'https://github.com/a', 'https://github.com/a/b/issues']) assert.ok(!REPO_RE.test(u), u)
})
test('licenseClass: nur permissiv darf Code liefern', () => {
  assert.match(licenseClass('MIT'), /permissiv/)
  assert.match(licenseClass('GPL-3.0'), /nur Ideen/)
  assert.match(licenseClass(null), /nur Ideen/)
})
