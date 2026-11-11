import { chromium } from 'playwright'
import http from 'node:http'; import os from 'node:os'; import fs from 'node:fs'; import path from 'node:path'
const EXT = process.argv[2]
let chatBody = null
const srv = http.createServer((req, res) => {
  let b = ''; req.on('data', d => b += d); req.on('end', () => {
    if (req.url === '/api/tags') return res.end(JSON.stringify({ models: [{ name: 'llama3:test' }] }))
    if (req.url === '/api/chat') { chatBody = b; return res.end(JSON.stringify({ message: { content: '{"topics":{"Erste":[0],"Zweite":[1]}}' } })) }
    res.setHeader('content-type', 'text/html'); res.end(`<title>Seite ${req.url}</title>x`)
  })
}).listen(11434)
const ok = (c, m) => console.log((c ? 'OK   ' : 'FAIL ') + m)
const ud = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-'))
const ctx = await chromium.launchPersistentContext(ud, { channel: 'chromium', headless: true, ignoreDefaultArgs: ['--disable-extensions'], args: ['--disable-features=DisableLoadExtensionCommandLineSwitch', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] })
const errs = []
let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent('serviceworker')
const id = sw.url().split('/')[2]
const page = await ctx.newPage()
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept())
await page.goto(`chrome-extension://${id}/newtab.html`); await page.waitForTimeout(800)
await page.evaluate(async (id) => {
  const { importFolders } = await import(`chrome-extension://${id}/lib/seed.js`)
  await importFolders((await (await fetch(`chrome-extension://${id}/data/seed-folders.json`)).json()).slice(0, 40))
}, id)
await page.waitForTimeout(1500)
ok(!(await page.locator('body').innerText()).includes('null'), 'kein "null" im Text')
// Sammelumbenennen
await page.locator('button[title^="Auswahlmodus"]').click()
await page.locator('.item').nth(0).click(); await page.locator('.item').nth(1).click()
const t0 = await page.locator('.item .t').nth(0).textContent()
await page.locator('#selbar button', { hasText: 'Umbenennen' }).click()
await page.locator('dialog input[placeholder="Suchen"]').fill(t0.slice(0, 2)); await page.locator('dialog input[placeholder="Ersetzen durch"]').fill('ZZ')
await page.waitForTimeout(200)
ok((await page.locator('.prev').textContent()).includes('ändern sich'), 'Vorschau live: ' + (await page.locator('.prev b').textContent()))
await page.locator('dialog button.primary').click(); await page.waitForTimeout(1200)
ok((await page.locator('.item .t').nth(0).textContent()).startsWith('ZZ'), 'Umbenennen angewendet')
await page.locator('#selbar button', { hasText: 'Fertig' }).click()
// Sicherung + Sitzung + Erinnerung
const r = await page.evaluate(async (id) => {
  const bk = await import(`chrome-extension://${id}/lib/backup.js`); const ss = await import(`chrome-extension://${id}/lib/sessions.js`); const st = await import(`chrome-extension://${id}/lib/store.js`)
  const l = await bk.saveBackup(); const S = await st.load(); await ss.saveSession(S, 'T', [{ title: 'a', url: 'http://localhost:11434/a' }]); await st.save(S); const sesBefore = (await st.load()).sessions.length
  const back = (await bk.listBackups())[0]
  const rr = await bk.restore(back)
  return { sesBefore, backups: l.length, folders: back.folders.length, restoredAdded: rr.added, sessions: (await st.load()).sessions.length }
}, id)
ok(r.backups >= 1 && r.folders > 10, 'Sicherung ' + JSON.stringify(r)); ok(r.restoredAdded === 0 && r.sesBefore === 1 && r.sessions === 0, 'Restore ergaenzt nichts doppelt, Zustand = Stand der Sicherung')
// KI mit Mock-Ollama
for (const p of ['a', 'b']) { const q = await ctx.newPage(); await q.goto('http://localhost:11434/' + p) }
await page.bringToFront(); await page.reload(); await page.waitForTimeout(800)
await page.locator('button[title="KI"]').click()
await page.locator('dialog button', { hasText: 'Modelle laden' }).click(); await page.waitForTimeout(800)
ok((await page.locator('#ai-models option').count()) === 1, 'Ollama-Modellliste geladen (/api/tags)')
await page.locator('dialog input[placeholder="Modell"]').fill('llama3:test')
await page.locator('dialog button', { hasText: 'Offene Tabs nach Themen sortieren' }).click(); await page.waitForTimeout(1500)
ok((await page.locator('.airesult h4').count()) === 2, 'KI-Themen angezeigt: ' + (await page.locator('.airesult h4').allTextContents()).join(', '))
ok(chatBody && JSON.parse(chatBody).model === 'llama3:test' && JSON.parse(chatBody).stream === false, 'Chat-Request korrekt')
await page.locator('dialog button', { hasText: 'Als Lesezeichen-Ordner speichern' }).click(); await page.waitForTimeout(1200)
const kt = await page.evaluate(async () => (await chrome.bookmarks.search({ title: 'KI-Themen' })).length)
ok(kt === 1, 'Ordner "KI-Themen" angelegt')
// Seitenleiste: eigene Ansicht anlegen
const sb = await ctx.newPage(); sb.on('pageerror', e => errs.push('sb ' + e.message)); sb.on('dialog', d => d.accept())
await sb.goto(`chrome-extension://${id}/sidebar.html`); await sb.waitForTimeout(800)
await sb.locator('button[title="Neue Ansicht"]').click(); await sb.locator('dialog input').first().fill('Mein Ordner'); await sb.locator('dialog button.primary').click(); await sb.waitForTimeout(400)
await sb.locator('dialog select').selectOption({ index: 3 }); await sb.locator('dialog button.primary').click(); await sb.waitForTimeout(1200)
ok((await sb.locator('#sidehead option').count()) === 6, 'eigene Ansicht angelegt (6 Ansichten)')
ok((await sb.locator('#body .item, #body p').count()) >= 1, 'Ansicht rendert Inhalt')
await sb.locator('#sidehead select').selectOption({ label: 'Tabs' }); await sb.waitForTimeout(500)
ok((await sb.locator('#body .item').count()) >= 3, 'Tabs-Ansicht listet offene Tabs')
console.log('JS-Fehler:', errs.length ? errs : 'keine')
await ctx.close(); srv.close()
