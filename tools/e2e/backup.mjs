// Ablauf „Sicherung“: Karte „Sicherung wiederherstellen“ (Datei und Ordner), Sicherungsordner schreiben/aufräumen.
// Der Ordnerdialog von Chromium ist headless nicht bedienbar: showDirectoryPicker wird durch das Ursprungs-Dateisystem (OPFS) ersetzt,
// das dieselbe Handle-Schnittstelle hat. Echte Ordnerwahl bleibt Handprüfung.
// Aufruf: node tools/e2e/backup.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

const BACKUP = { v: 1, ts: 1, state: { tags: { urlaub: '#ef4444' }, settings: { theme: 'dark', ai: { orKey: '' } } }, folders: [{ path: ['Wieder'], items: [{ t: 'Zurück A', u: 'https://example.org/zurueck-a' }] }] }
const day = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}` }

flow('backup', async ({ ok, ctx, newtab, until, poll }) => {
  await ctx.addInitScript(() => { window.showDirectoryPicker = () => navigator.storage.getDirectory()
    // Zugriff „abgelaufen“ nachstellen: sessionStorage.perm = 'prompt'; requestPermission (Klick) erteilt ihn wieder
    const P = globalThis.FileSystemHandle?.prototype
    if (P) { P.queryPermission = async () => sessionStorage.getItem('perm') || 'granted'; P.requestPermission = async () => { sessionStorage.removeItem('perm'); return 'granted' } }
  })
  const page = await newtab()
  const nag = '#nag [data-restore]'
  // OPFS-Helfer im Seitenkontext (CSP der Erweiterung erlaubt kein eval, daher je eine eigene Funktion)
  const names = () => page.evaluate(async () => { const d = await navigator.storage.getDirectory(), o = []; for await (const [n] of d.entries()) o.push(n); return o.sort() })
  const put = (name, text) => page.evaluate(async ([n, t]) => { const w = await (await (await navigator.storage.getDirectory()).getFileHandle(n, { create: true })).createWritable(); await w.write(t); await w.close() }, [name, text])
  // Während die App die Datei ersetzt, kann das Lesen kurz scheitern: dann leer, der Aufrufer fragt per poll erneut
  const read = (name) => page.evaluate(async (n) => { try { return await (await (await (await navigator.storage.getDirectory()).getFileHandle(n)).getFile()).text() } catch { return '' } }, name)
  const wipeFolder = () => page.evaluate(async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n) })

  // --- Karte bei frischem Profil
  ok(await until(page, (s) => !!document.querySelector(s), nag), 'Frisches Profil: Karte „Sicherung wiederherstellen“ erscheint')
  ok((await page.locator(`${nag} button`).allTextContents()).join('|') === 'Aus Sicherungsordner|Datei wählen|Später', 'Karte bietet Ordner (Chromium), Datei und Später')

  // Ungültige Datei: Meldung, nichts verändert
  await page.locator(`${nag} input[type=file]`).setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"a":1}') })
  ok(await until(page, () => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('Import fehlgeschlagen'))), 'Ungültige Datei: Fehlermeldung')
  ok((await page.evaluate(() => chrome.storage.local.get('pika').then((r) => Object.keys(r.pika?.tags || {}).length))) === 0 && (await page.locator(nag).count()) === 1, 'Ungültige Datei: nichts verändert, Karte bleibt')

  // Aus Sicherungsordner: Liste, Einspielen
  await put('pika-altgeraet-20250101.json', JSON.stringify(BACKUP)); await put('urlaub.jpg', 'x')
  await page.locator(`${nag} button`, { hasText: 'Aus Sicherungsordner' }).click()
  const dlg = page.locator('dialog', { has: page.locator('h3', { hasText: 'Aus Sicherungsordner' }) })
  await dlg.locator('.lrow').first().waitFor()
  ok((await dlg.locator('.lrow').count()) === 1 && /pika-altgeraet-20250101\.json/.test(await dlg.locator('.lrow').innerText()), 'Ordnerliste zeigt nur *.json (Fremddatei ausgeblendet)')
  await dlg.locator('.lrow button', { hasText: 'Einspielen' }).click() // confirm() wird vom Harness bestätigt
  ok(await until(page, async () => (await chrome.bookmarks.search({ url: 'https://example.org/zurueck-a' })).length === 1 && Object.keys((await chrome.storage.local.get('pika')).pika.tags).includes('urlaub')), 'Aus Ordner: Zustand und fehlendes Lesezeichen sind wieder da')
  ok(await poll(async () => (await page.locator(nag).count()) === 0), 'Nach dem Einspielen verschwindet die Karte')

  // Datei wählen: Profil wieder leeren, gültige Datei
  await page.evaluate(async () => { for (const b of await chrome.bookmarks.search({ url: 'https://example.org/zurueck-a' })) await chrome.bookmarks.remove(b.id); await chrome.storage.local.clear() })
  await page.reload(); await page.waitForSelector('#top button')
  ok(await until(page, (s) => !!document.querySelector(s), nag), 'Leeres Profil: Karte wieder da')
  await page.locator(`${nag} input[type=file]`).setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(BACKUP)) })
  ok(await until(page, async () => (await chrome.bookmarks.search({ url: 'https://example.org/zurueck-a' })).length === 1 && (await chrome.storage.local.get('pika')).pika.settings.theme === 'dark'), 'Datei wählen: Zustand und Lesezeichen wiederhergestellt')
  await page.waitForLoadState('load'); await page.waitForSelector('#top button')
  ok(await poll(async () => (await page.locator(nag).count()) === 0), 'Datei wählen: Karte verschwindet')

  // --- Sicherungsordner einrichten
  await wipeFolder()
  for (let i = 1; i <= 6; i++) await put(`pika-geraet-2026010${i}.json`, '{}') // 6 alte Tage
  await put('urlaub.jpg', 'x'); await put('pika-anderes-20250101.json', '{}')
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.ai.orKey = 'sk-or-GEHEIM' }) })
  await page.reload(); await page.waitForSelector('#top button')
  await page.locator('#top button[aria-label="Einstellungen"]').click()
  const set = page.locator('dialog', { has: page.locator('h3', { hasText: 'Einstellungen' }) })
  await set.locator('button', { hasText: 'Ordner wählen' }).click()
  const today = `pika-geraet-${day()}.json`
  ok(await poll(async () => (await names()).includes(today)), 'Ordner gewählt: Tagesdatei ' + today + ' liegt im Ordner')
  await poll(async () => (await names()).filter((n) => /^pika-geraet-\d{8}\.json$/.test(n)).length <= 5) // Aufräumen folgt dem Schreiben
  const left = await names()
  ok(left.filter((n) => /^pika-geraet-\d{8}\.json$/.test(n)).length === 5 && !left.includes('pika-geraet-20260101.json') && !left.includes('pika-geraet-20260102.json'), 'Nur die 5 neuesten eigenen Dateien bleiben: ' + left.join(','))
  ok(left.includes('urlaub.jpg') && left.includes('pika-anderes-20250101.json'), 'Fremde Dateien bleiben (urlaub.jpg, anderes Gerät)')
  const txt = await read(today)
  ok(JSON.parse(txt).v === 1 && !txt.includes('GEHEIM'), 'Datei ist eine Sicherung ohne API-Schlüssel')
  ok(await until(page, () => /aktiv, letzte Sicherung/.test(document.querySelector('dialog .muted')?.textContent || '')), 'Status zeigt „Ordner … aktiv, letzte Sicherung …“')
  const st = await page.evaluate(() => chrome.storage.local.get('pika').then((r) => r.pika.settings.backup))
  ok(st.folder.on && st.folder.lastWrite > 0 && st.lastExport === st.folder.lastWrite, 'Einstellung: on, lastWrite und lastExport gesetzt')
  // „Speichern“ ohne die Checkbox anzuhaken darf die Ordnerwahl nicht zurücksetzen
  await set.locator('button', { hasText: 'Speichern' }).click(); await page.waitForSelector('dialog', { state: 'detached' })
  ok(await poll(async () => (await page.evaluate(() => chrome.storage.local.get('pika').then((r) => r.pika.settings.backup.folder.on))) === true), 'Ordner gewählt + Speichern: backup.folder.on bleibt true')

  // Hinweis schweigt, Ordnerdatei nur einmal je Tag
  await page.reload(); await page.waitForSelector('#top button')
  ok((await page.locator('#nag .nag').count()) === 0, 'Kein Sicherungshinweis, solange der Ordner täglich beschrieben wird')
  // Gestern zuletzt geschrieben: der nächste Neue Tab schreibt wieder (Datei von heute wird ersetzt, nicht verdoppelt)
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.backup.folder.lastWrite = Date.now() - 864e5 - 1000 }) })
  await put(today, '{"alt":1}')
  await page.reload(); await page.waitForSelector('#top button')
  ok(await poll(async () => (await read(today)).includes('"v":1')), 'Neuer Tag: Datei wird beim Start des Neuen Tabs neu geschrieben')
  ok((await names()).filter((n) => /^pika-geraet-/.test(n)).length === 5, 'Weiterhin höchstens 5 eigene Dateien')

  // Zugriff abgelaufen (Browserneustart): nichts schreiben, Hinweis „Zugriff erneuern“, nach Klick wird geschrieben
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.backup.folder.lastWrite = Date.now() - 2 * 864e5 }); sessionStorage.setItem('perm', 'prompt') })
  await page.evaluate(async (n) => (await navigator.storage.getDirectory()).removeEntry(n), today)
  await page.reload(); await page.waitForSelector('#top button')
  const bar = page.locator('#nag .nag', { hasText: 'Zugriff' })
  await bar.waitFor()
  ok(!(await names()).includes(today), 'Zugriff abgelaufen: Hinweis „Zugriff erneuern“ und nichts geschrieben')
  await bar.locator('button', { hasText: 'Zugriff erneuern' }).click()
  ok(await poll(async () => (await names()).includes(today)), 'Nach Klick auf „Zugriff erneuern“ liegt die Tagesdatei wieder im Ordner')
  ok(await poll(async () => (await page.locator('#nag .nag').count()) === 0), 'Hinweisleiste verschwindet nach der Sicherung')
})
