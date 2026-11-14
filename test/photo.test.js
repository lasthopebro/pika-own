import test from 'node:test'
import assert from 'node:assert/strict'
import { httpsUrl, parsePhotoUrls, MAX_PHOTOS } from '../lib/photo.js'

test('httpsUrl: nur https mit Host', () => {
  assert.equal(httpsUrl(' https://example.org/a.png '), 'https://example.org/a.png')
  for (const bad of ['javascript:alert(1)', 'http://example.org/a.png', 'data:image/png;base64,AAAA', 'file:///c:/a.png', 'ftp://x/y', 'https://', 'kein url', '', null, undefined]) assert.equal(httpsUrl(bad), null, String(bad))
})
test('parsePhotoUrls: gültige Zeilen, Dubletten fallen weg, Leerzeilen ignoriert', () => {
  assert.deepEqual(parsePhotoUrls('https://a.example/1.jpg\n\n https://a.example/1.jpg \r\nhttps://b.example/2.jpg'), { urls: ['https://a.example/1.jpg', 'https://b.example/2.jpg'] })
  assert.deepEqual(parsePhotoUrls(''), { urls: [] })
})
test('parsePhotoUrls: javascript: und http: werden abgelehnt, auch zwischen gültigen', () => {
  assert.match(parsePhotoUrls('javascript:alert(1)').error, /https/)
  assert.match(parsePhotoUrls('https://a.example/1.jpg\nhttp://b.example/2.jpg').error, /http:\/\/b\.example/)
})
test('parsePhotoUrls: höchstens 6', () => {
  const n = (k) => Array.from({ length: k }, (_, i) => `https://a.example/${i}.jpg`).join('\n')
  assert.equal(parsePhotoUrls(n(MAX_PHOTOS)).urls.length, 6)
  assert.match(parsePhotoUrls(n(MAX_PHOTOS + 1)).error, /Höchstens 6/)
})
