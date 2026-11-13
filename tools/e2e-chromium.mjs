import { chromium } from 'playwright'
import http from 'node:http'; import os from 'node:os'; import fs from 'node:fs'; import path from 'node:path'
const EXT = process.argv[2]
let chatBody = null, pullBody = null
const srv = http.createServer((req, res) => {
  let b = ''; req.on('data', d => b += d); req.on('end', () => {
    if (req.url === '/api/version') return res.end('{"version":"0.0.0"}')
    if (req.url === '/api/tags') return res.end(JSON.stringify({ models: [{ name: 'llama3:test', size: 2e9 }] }))
    if (req.url === '/api/pull') { pullBody = b; return res.end('{"status":"pulling abc","total":200,"completed":100}\n{"status":"success"}\n') }
    if (req.url === '/api/chat') { chatBody = b; return res.end(JSON.stringify({ message: { content: '{"topics":{"Erste":[0],"Zweite":[1]}}' } })) }
    res.setHeader('content-type', 'text/html'); if (req.url === '/csp') res.setHeader('content-security-policy', "default-src 'none'"); res.end(`<title>Seite ${req.url}</title>x`)
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
for (const p of ['a', 'b', 'c']) { const q = await ctx.newPage(); await q.goto('http://localhost:11434/' + p) }
await page.bringToFront(); await page.reload(); await page.waitForTimeout(1500)
ok((await page.locator('#resume .card').count()) >= 1, 'Weitermachen-Karte aus dem Verlauf: ' + (await page.locator('#resume .card b').first().textContent().catch(() => '-')))
await page.locator('button[title="KI"]').click()
await page.waitForTimeout(1000)
ok((await page.locator('.dot.on').count()) === 1, 'Ollama-Status grün (/api/version)')
ok((await page.locator('.aimodels input[type=radio]').count()) === 1, 'Ollama-Modellliste mit Größe: ' + (await page.locator('.aimodels .lrow').first().innerText()).replace(/\n/g, ' '))
await page.locator('.aimodels input[type=radio]').check(); await page.waitForTimeout(500)
await page.locator('dialog button', { hasText: 'Offene Tabs nach Themen sortieren' }).click(); await page.waitForTimeout(1500)
ok((await page.locator('.airesult h4').count()) === 3, 'KI-Themen angezeigt (2 vom Modell + Sonstiges für den dritten Tab): ' + (await page.locator('.airesult h4').allTextContents()).join(', '))
const cb = JSON.parse(chatBody || '{}')
ok(cb.model === 'llama3:test' && cb.stream === false && cb.think === false && cb.format?.required?.[0] === 'topics', 'Chat-Request: Modell, think:false, JSON-Schema')
await page.locator('.aimodels button', { hasText: 'Herunterladen' }).first().click(); await page.waitForTimeout(1500)
ok(pullBody && JSON.parse(pullBody).model === 'qwen3:4b', 'Download-Request /api/pull für qwen3:4b')
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
// Leiste und Live-Ordner (v0.4)
const msg = (p, m) => p.evaluate((m) => chrome.runtime.sendMessage(m), m)
await msg(page, { type: 'lf', op: 'add', args: ['Projekt'] })
let bar = await msg(page, { type: 'getBar', host: '' })
const pf = bar.folders.find((f) => f.name === 'Projekt')
await msg(page, { type: 'lf', op: 'assign', args: [pf.id, 'http://localhost:11434/a', 'Seite a'] })
await msg(page, { type: 'lf', op: 'assign', args: [pf.id, 'http://localhost:11434/zu', 'Seite zu'] })
await page.reload(); await page.waitForTimeout(1200)
ok((await page.locator('#pikabar .pb button', { hasText: 'Projekt' }).count()) === 1, 'Leiste zeigt Live-Ordner "Projekt" mit Symbol')
bar = await msg(page, { type: 'getBar', host: '' })
ok(bar.folders.find((f) => f.name === 'Projekt').items.map((i) => i.live).join() === 'true,false', 'Live-Markierung: offener Tab erkannt, geschlossener nicht')
const tabsBefore = ctx.pages().length
await msg(page, { type: 'focusOrOpen', url: 'http://localhost:11434/a' }); await page.waitForTimeout(500)
ok(ctx.pages().length === tabsBefore, 'Öffnen ohne Duplikat (vorhandener Tab wird fokussiert)')
const tq = Date.now(); await msg(page, { type: 'getBar', host: '' }); ok(Date.now() - tq < 200, `getBar unter 200 ms (${Date.now() - tq} ms)`)
// Leiste auf Webseiten (v0.5): einschalten, strenge CSP, Ausschlussliste, Zustand klein
await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.on = true }) })
await msg(page, { type: 'pagebar' }); await page.waitForTimeout(500)
const cp = await ctx.newPage(); await cp.goto('http://localhost:11434/csp'); await cp.waitForTimeout(1500)
ok((await cp.evaluate(() => getComputedStyle(document.documentElement).marginTop)) === '30px', 'Leiste auf Seite mit strenger CSP sichtbar (Seite 30 px nach unten)')
await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.exclude = 'localhost' }) })
await cp.reload(); await cp.waitForTimeout(1500)
ok((await cp.evaluate(() => getComputedStyle(document.documentElement).marginTop)) === '0px', 'Ausschlussliste: Leiste fehlt auf localhost')
const slim = await msg(page, { type: 'getBar', host: '' })
ok(!('settings' in slim) && !('meta' in slim) && JSON.stringify(slim).length < 20000, 'getBar liefert nur den schlanken Ausschnitt (' + JSON.stringify(slim).length + ' Zeichen)')
await ctx.close()
const ctx2 = await chromium.launchPersistentContext(ud, { channel: 'chromium', headless: true, ignoreDefaultArgs: ['--disable-extensions'], args: ['--disable-features=DisableLoadExtensionCommandLineSwitch', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] })
let [sw2] = ctx2.serviceWorkers(); if (!sw2) sw2 = await ctx2.waitForEvent('serviceworker')
const p2 = await ctx2.newPage(); await p2.goto(`chrome-extension://${sw2.url().split('/')[2]}/newtab.html`); await p2.waitForTimeout(800)
const bar2 = await msg(p2, { type: 'getBar', host: '' })
ok(bar2.folders.some((f) => f.name === 'Projekt' && f.items.length === 2), 'Live-Ordner nach Neustart des Browsers noch da')
await ctx2.close()
console.log('JS-Fehler:', errs.length ? errs : 'keine')
srv.close()
