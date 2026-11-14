// Ablauf „Board“: Sammelumbenennen, Sicherung, Manifest, Kopf, Menüs per Tastatur, Einstellungen, Löschen, Links im neuen Tab.
// Aufruf: node tools/e2e/board.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('board', async ({ ctx, id, ok, msg, newtab, seed, until, poll, MOCK }) => {
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'])
  const page = await newtab()
  let dlgN = 0; page.on('dialog', () => dlgN++)
  await seed(page)
  ok(!(await page.locator('body').innerText()).includes('null'), 'kein "null" im Text')

  // Sammelumbenennen
  await page.locator('button[title^="Auswahlmodus"]').click()
  await page.locator('.item').nth(0).click(); await page.locator('.item').nth(1).click()
  const t0 = await page.locator('.item .t').nth(0).textContent()
  await page.locator('#selbar button', { hasText: 'Umbenennen' }).click()
  await page.locator('dialog input[placeholder="Suchen"]').fill(t0.slice(0, 2)); await page.locator('dialog input[placeholder="Ersetzen durch"]').fill('ZZ')
  ok(await until(page, () => document.querySelector('.prev')?.textContent.includes('ändern sich')), 'Vorschau live: ' + (await page.locator('.prev b').textContent().catch(() => '-')))
  await page.locator('dialog button.primary').click()
  ok(await until(page, () => document.querySelector('.item .t')?.textContent.startsWith('ZZ')), 'Umbenennen angewendet')
  await page.locator('#selbar button', { hasText: 'Fertig' }).click()

  // Sicherung + Sitzung + Erinnerung
  const r = await page.evaluate(async ([id, mock]) => {
    const bk = await import(`chrome-extension://${id}/lib/backup.js`); const ss = await import(`chrome-extension://${id}/lib/sessions.js`); const st = await import(`chrome-extension://${id}/lib/store.js`)
    const l = await bk.saveBackup(); await st.update((S) => ss.saveSession(S, 'T', [{ title: 'a', url: mock + '/a' }])); const sesBefore = (await st.load()).sessions.length
    const back = (await bk.listBackups())[0]
    const rr = await bk.restore(back)
    return { sesBefore, backups: l.length, folders: back.folders.length, restoredAdded: rr.added, sessions: (await st.load()).sessions.length }
  }, [id, MOCK])
  ok(r.backups >= 1 && r.folders > 10, 'Sicherung ' + JSON.stringify(r)); ok(r.restoredAdded === 0 && r.sesBefore === 1 && r.sessions === 0, 'Restore ergaenzt nichts doppelt, Zustand = Stand der Sicherung')

  // Manifest, Kopf, Mehr-Menü
  const mf = await page.evaluate(() => chrome.runtime.getManifest())
  ok(mf.icons['16'] === 'icons/icon-16.png' && mf.icons['128'] === 'icons/icon-128.png' && mf.action.default_icon['16'] === 'icons/icon-16.png' && mf.sidebar_action.default_icon['16'] === 'icons/icon-16.png', 'Manifest: eigenes Programmsymbol (16 bis 128, Werkzeugleiste, Seitenleiste)')
  const cmdNames = await page.evaluate(() => chrome.commands.getAll().then((c) => c.map((x) => x.name)))
  ok(['save-page', 'toggle-bar', '_execute_action'].every((n) => cmdNames.includes(n)), 'Tastenkürzel im Manifest: ' + cmdNames.join(', '))
  // Live-Ordner „Projekt“ für die Menü-Prüfungen
  await msg(page, { type: 'lf', op: 'add', args: ['Projekt'] })
  await page.reload(); await page.waitForSelector('#top button'); await page.waitForSelector('.item')
  ok((await page.locator('#top button').count()) === 7 && (await page.locator('#top button.search').count()) === 1, 'Kopf: Suche und fünf Symbol-Knöpfe plus „Mehr“ (7 Knöpfe)')
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('#top button, #pikabar button')].filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim())).length)
  ok(unnamed === 0 && (await page.locator('#top svg[aria-hidden=true]').count()) >= 6, 'Jeder Symbol-Knopf hat einen Namen, die Symbole sind stumm')
  await page.locator('#top button[aria-label="Mehr"]').click()
  ok((await page.locator('.ctx[role=menu] [role=menuitem]').count()) >= 4, 'Mehr-Menü mit Rollen menu/menuitem')
  await page.locator('.ctx button', { hasText: 'Widget hinzufügen' }).click()
  ok((await page.locator('dialog h3', { hasText: 'Widget' }).count()) === 1, 'Mehr, Widget hinzufügen öffnet den bisherigen Dialog')
  await page.keyboard.press('Escape'); await page.waitForSelector('dialog', { state: 'detached' })

  // Menü per Tastatur: Fokus auf erstem Eintrag, zweimal runter + Enter = dritter Eintrag (Live-Ordner-Untermenü)
  const first = page.locator('.item').first(), href = await first.getAttribute('href'), ttl = (await first.locator('.t').textContent()).trim()
  await first.click({ button: 'right' })
  ok((await page.evaluate(() => document.activeElement?.getAttribute('role'))) === 'menuitem' && (await page.locator('.ctx').getAttribute('role')) === 'menu', 'Menü: erster Eintrag hat den Fokus')
  await page.keyboard.press('Escape')
  ok((await page.locator('.ctx').count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('item'))), 'Esc schließt das Menü und gibt den Fokus zurück')
  await first.click({ button: 'right' }); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter')
  ok((await page.locator('.ctx button', { hasText: '‹ Zurück' }).count()) === 1 && (await page.locator('.ctx button', { hasText: 'Projekt' }).count()) === 1, 'Zweimal Pfeil runter + Enter öffnet „In Live-Ordner legen ▸“')
  await page.keyboard.press('ArrowDown')
  ok((await page.evaluate(() => document.activeElement?.textContent)).includes('Projekt'), 'Pfeil runter im Untermenü springt zu „Projekt“')
  await page.keyboard.press('Enter')
  const inProjekt = async () => (await msg(page, { type: 'getBar', host: '' })).folders.filter((f) => !f.ro)
  let lfs = []
  ok(await until(page, async (h) => { const b = await chrome.runtime.sendMessage({ type: 'getBar', host: '' }); return b.folders.some((f) => f.name === 'Projekt' && f.items.some((i) => i.u === h)) }, href), 'In Live-Ordner legen: Adresse liegt in „Projekt“'); lfs = await inProjekt()
  ok(lfs.filter((f) => f.items.some((i) => i.u === href)).length === 1, 'In Live-Ordner legen: Adresse liegt in keinem anderen Ordner')
  await first.click({ button: 'right' }); await page.locator('.ctx button', { hasText: 'Als Markdown kopieren' }).click()
  ok(await until(page, async (t) => (await navigator.clipboard.readText()) === t, `[${ttl}](${href})`), 'Als Markdown kopieren: [Titel](Adresse)')

  // ? öffnet die Kürzel-Übersicht
  await page.locator('body').click({ position: { x: 5, y: 300 } }); await page.keyboard.press('?'); await page.waitForSelector('dialog .keys tr')
  const keysTxt = await page.locator('dialog').allInnerTexts()
  ok((await page.locator('dialog h3', { hasText: 'Tastenkürzel' }).count()) === 1 && (await page.locator('dialog .keys tr').count()) >= 9 && /Alt\+/.test(keysTxt.join()), 'Taste ? zeigt alle Kürzel (' + (await page.locator('dialog .keys tr').count()) + ' Zeilen)')
  if (process.env.E2E_DEBUG) console.log(keysTxt.join('|').slice(0, 600))
  await page.keyboard.press('Escape'); await page.waitForSelector('dialog', { state: 'detached' })

  // Einstellungen: Abschnitte, Suche mit /
  const pbOn0 = await page.evaluate(async () => (await (await import('./lib/store.js')).load()).settings.pagebar.on)
  await page.locator('#top button[aria-label="Einstellungen"]').click(); await page.waitForSelector('dialog .sec')
  ok((await page.locator('dialog .sec').count()) === 8, 'Einstellungen in 8 Abschnitte gegliedert')
  await page.locator('dialog h3').click(); await page.keyboard.press('/'); await page.keyboard.type('pomo')
  ok(await until(page, () => document.querySelectorAll('dialog .sec:not([hidden])').length === 1), 'Suche: ein Abschnitt bleibt sichtbar')
  ok((await page.locator('dialog .row:visible').count()) === 2 && (await page.locator('dialog .sec:visible').count()) === 1, 'Suche „pomo“ zeigt nur die Pomodoro-Optionen und ihren Abschnitt')
  await page.locator('dialog input.dsearch').fill('')
  await page.getByLabel('Leiste im Neuen Tab anzeigen').uncheck(); await page.getByLabel('Löschen einzelner Links bestätigen').uncheck(); await page.getByLabel('Links im Board im neuen Tab öffnen').check()
  await page.locator('dialog button.primary').click()
  ok(await until(page, () => document.getElementById('pikabar')?.hidden || getComputedStyle(document.getElementById('pikabar')).display === 'none'), 'Leiste im Neuen Tab aus: nicht mehr sichtbar')
  ok((await page.evaluate(async () => (await (await import('./lib/store.js')).load()).settings.pagebar.on)) === pbOn0, 'Leiste auf Webseiten bleibt unverändert')

  // Link ohne Bestätigung löschen, Rückgängig; Ordner bleibt bestätigt
  const barId = await page.evaluate(() => chrome.bookmarks.getTree().then((t) => t[0].children[0].id))
  await page.evaluate((p) => chrome.bookmarks.create({ parentId: p, index: 0, title: 'LoeschTest', url: 'https://example.org/loeschtest' }), barId)
  await page.waitForSelector('.item:has-text("LoeschTest")')
  const d0 = dlgN
  await page.locator('.item', { hasText: 'LoeschTest' }).click({ button: 'right' }); await page.locator('.ctx button', { hasText: 'Löschen' }).click()
  const lt = () => page.evaluate(() => chrome.bookmarks.search({ url: 'https://example.org/loeschtest' }))
  await page.waitForSelector('.toast button:has-text("Rückgängig")')
  ok(dlgN === d0 && (await lt()).length === 0, 'Link ohne Nachfrage gelöscht (Option aus)')
  await page.locator('.toast button', { hasText: 'Rückgängig' }).click()
  ok(await until(page, async () => (await chrome.bookmarks.search({ url: 'https://example.org/loeschtest' })).length === 1), 'Rückgängig: Link ist wieder da')
  const back = await lt()
  ok(back.length === 1 && back[0].index === 0 && back[0].parentId === barId, 'Rückgängig legt den Link am selben Platz wieder an')
  await page.evaluate(async (p) => { const f = await chrome.bookmarks.create({ parentId: p, title: 'LoeschOrdner' }); await chrome.bookmarks.create({ parentId: f.id, title: 'x', url: 'https://example.org/x' }) }, barId)
  await page.waitForSelector('.colhead:has-text("LoeschOrdner")')
  await page.locator('.colhead', { hasText: 'LoeschOrdner' }).locator('button').click(); await page.locator('.ctx button', { hasText: 'Ordner löschen' }).click()
  ok(await poll(() => dlgN === d0 + 1), 'Ordner löschen fragt immer nach')

  // Links im neuen Tab
  const np = ctx.pages().length
  await page.locator('.item').first().click()
  ok(await poll(() => ctx.pages().length === np + 1) && page.url().includes('newtab.html'), 'Option „Links im neuen Tab“: Lesezeichen öffnet neuen Tab, Neuer Tab bleibt')
})
