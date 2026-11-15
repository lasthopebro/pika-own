// Ablauf „Tour“: erscheint beim ersten Start, Esc und Überspringen beenden sie dauerhaft, die Palette startet sie neu,
// fehlende Ziele werden übersprungen, Fokus bleibt im Dialog und kehrt zurück, Änderungen aus anderen Tabs stören sie nicht.
// Aufruf: node tools/e2e/tour.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('tour', async ({ id, ok, newtab, seed, until, poll }) => {
  const page = await newtab()
  const card = page.locator('dialog.tour[open]')
  const titleOf = (p = card) => p.locator('h3').innerText()
  const label = () => card.locator('p[role=status]').innerText()
  const tourDone = () => page.evaluate(async () => (await chrome.storage.local.get('pika')).pika?.settings?.tourDone === true)
  const gone = () => poll(async () => (await page.locator('dialog.tour').count()) === 0)
  const startFromPalette = async () => {
    await page.locator('body').click({ position: { x: 5, y: 300 } }); await page.keyboard.press('f')
    const pal = page.locator('dialog.pal[open]'); await pal.waitFor()
    await pal.locator('input').fill('>Tour (Erste')
    await pal.locator('.plist div', { hasText: 'Tour (Erste Schritte)' }).click()
    await card.waitFor()
  }
  // Alle Schritte mit „Weiter“ durchgehen; liefert die Titel. Der letzte Knopf heißt „Fertig“.
  const walk = async () => {
    const titles = []
    for (;;) {
      const t = await titleOf(); titles.push(t)
      const b = card.locator('button.primary'), last = (await b.innerText()) === 'Fertig'
      await b.click()
      if (last) return titles
      if (!(await poll(async () => (await titleOf().catch(() => t)) !== t))) return titles
    }
  }
  const items = await page.locator('#board .item').count()
  const total = items ? 5 : 4 // Schritt „Rechtsklick auf ein Lesezeichen“ braucht ein Lesezeichen im Board

  // Erster Start: Tour da, noch nichts gespeichert
  ok((await card.count()) === 1, 'Beim ersten Start erscheint die Tour')
  ok((await tourDone()) === false, 'Beim Zeigen ist sie noch nicht als gesehen gemerkt')
  ok((await label()) === `Schritt 1 von ${total}`, `Zähler „Schritt 1 von ${total}“ (Ziele, die fehlen, zählen nicht): ${await label()}`)
  ok((await card.getAttribute('aria-labelledby')) === 'tour-title' && (await titleOf()).length > 0 && (await card.locator('#tour-text').innerText()).length > 0, 'Dialog hat Namen und Beschreibung')
  ok(await page.evaluate(() => document.activeElement?.closest('dialog.tour') !== null && document.activeElement.textContent === 'Weiter'), 'Fokus liegt auf „Weiter“ im Dialog')
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
  ok(await page.evaluate(() => document.activeElement?.closest('dialog.tour') !== null), 'Fokusfalle: nach 6 Tabs noch im Dialog')
  await card.locator('button.primary').click()
  ok(await poll(async () => (await label()) === `Schritt 2 von ${total}`), 'Weiter zeigt Schritt 2')
  const near = await page.evaluate(() => { const r = document.querySelector('.tour-ring').getBoundingClientRect(), t = document.querySelector('#top .search').getBoundingClientRect(); return Math.abs(r.left - t.left) < 8 && Math.abs(r.top - t.top) < 8 && Math.abs(r.width - t.width) < 12 })
  ok(near, 'Der Ring liegt um das Ziel von Schritt 2 (Suchfeld)')

  // Fremdänderung (anderer Neuer Tab) lässt die Tour stehen
  const p2 = await newtab()
  const changed = page.evaluate(() => new Promise((r) => chrome.storage.onChanged.addListener(function f(ch) { if (ch.pika) { chrome.storage.onChanged.removeListener(f); r(true) } })))
  await p2.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.sessions.push({ name: 'x', ts: 1, tabs: [] }) }) })
  await changed
  ok((await card.count()) === 1 && (await label()) === `Schritt 2 von ${total}`, 'Änderung aus anderem Tab lässt die Tour bei Schritt 2')
  await p2.close(); await page.bringToFront()

  // Esc beendet, merkt sich das, gibt den Fokus zurück
  await page.keyboard.press('Escape')
  ok(await gone(), 'Esc schließt die Tour')
  ok(await poll(tourDone), 'Esc merkt sich „gesehen“ im Einstellungsschema')
  ok(await until(page, () => document.activeElement?.classList.contains('search')), 'Fokus kehrt auf den Suchknopf zurück')
  await page.reload(); await page.waitForSelector('#top button')
  ok((await page.locator('dialog.tour').count()) === 0 && (await page.locator('dialog[open]').count()) === 0, 'Nächster Neuer Tab: keine Tour mehr')

  // Palette startet neu, auch wenn gesehen; ohne Lesezeichen entfällt der Schritt „Rechtsklick“
  await startFromPalette()
  ok((await label()) === `Schritt 1 von ${total}`, 'Palette „Tour“ beginnt von vorn')
  const t1 = await walk()
  ok(t1.length === total && (items || !t1.includes('Rechtsklick auf ein Lesezeichen')), `Alle ${total} Schritte, fehlendes Ziel übersprungen: ${t1.join(' | ')}`)
  ok(await gone() && await tourDone(), 'Fertig schließt die Tour, Merker bleibt')

  // Mit Lesezeichen sind es 5; Überspringen beendet sofort
  await seed(page)
  await startFromPalette()
  ok((await label()) === 'Schritt 1 von 5', 'Mit Lesezeichen im Board hat die Tour 5 Schritte')
  const t2 = await walk()
  ok(t2.length === 5 && t2.includes('Rechtsklick auf ein Lesezeichen'), 'Schritt „Rechtsklick auf ein Lesezeichen“ ist dabei: ' + t2.join(' | '))
  await startFromPalette()
  await card.locator('button', { hasText: 'Überspringen' }).click()
  ok(await gone() && await tourDone(), 'Überspringen schließt sofort, Merker bleibt')
  ok(await until(page, () => document.activeElement?.classList.contains('search')), 'Fokus kehrt nach Überspringen zurück')

  // Galerie offen: die Palette schließt sie, die Tour läuft auf dem Board
  await page.keyboard.press('v'); await page.waitForSelector('#gal')
  await startFromPalette()
  ok((await page.locator('#gal').count()) === 0 && (await label()) === 'Schritt 1 von 5', 'Aus der Galerie gestartet: Galerie zu, Tour mit allen 5 Schritten')
  await page.keyboard.press('Escape'); await gone()

  // --- Leere Ordner: aus, bis man sie einschaltet; zeigt nur oberste leere Ordner; aufräumen über den Papierkorb mit Rückgängig
  const bar = await page.evaluate(async () => (await chrome.bookmarks.getTree())[0].children[0].id)
  const mk = (parentId, title, url) => page.evaluate(([p, t, u]) => chrome.bookmarks.create({ parentId: p, title: t, ...(u ? { url: u } : {}) }).then((n) => n.id), [parentId, title, url])
  const find = (title) => page.evaluate((t) => chrome.bookmarks.search({ title: t }).then((r) => r.map((x) => ({ parentId: x.parentId, index: x.index, folder: !x.url }))), title)
  await mk(bar, 'Leer A'); const b1 = await mk(bar, 'Leer B'); await mk(b1, 'Leer B1'); const cId = await mk(bar, 'Leer C')
  const voll = await mk(bar, 'Nicht leer'); await mk(voll, 'Ein Link', 'https://example.org/ein-link'); await mk(voll, 'Leer im vollen Ordner')
  const before = JSON.stringify([await find('Leer A'), await find('Leer B'), await find('Leer C'), await find('Leer im vollen Ordner')])
  await page.reload(); await page.waitForSelector('.item')
  const col = page.locator('section.col', { has: page.locator('.colname', { hasText: /^Leere Ordner$/ }) })
  ok((await col.count()) === 0, 'Standard: keine Spalte „Leere Ordner“')
  await page.locator('#top button[aria-label="Einstellungen"]').click()
  const set = page.locator('dialog', { has: page.locator('h3', { hasText: 'Einstellungen' }) })
  await set.locator('label.row', { hasText: 'Leere Ordner' }).locator('input').check()
  await set.locator('button.primary', { hasText: 'Speichern' }).click()
  await col.waitFor()
  const names = () => col.locator('.colbody > details > summary').allTextContents().then((t) => t.map((x) => x.trim().replace(/\s+\d*$/, '')))
  ok(await poll(async () => (await names()).join('|') === 'Leer A|Leer B|Leer C|Leer im vollen Ordner'), 'Spalte zeigt Leer A, Leer B (mit leerem Unterordner), Leer C und den leeren Ordner im vollen Ordner, nicht „Nicht leer“: ' + (await names()).join('|'))
  ok((await col.locator('.colhead .muted').first().innerText()) === '4', 'Zahl im Kopf: 4 Ordner')
  await mk(cId, 'Spät', 'https://example.org/spaet') // ein anderer Tab füllt Leer C, nachdem die Spalte gezeigt wurde (Schnappschuss ist veraltet)
  await col.locator('button', { hasText: 'Alle aufräumen' }).click() // confirm() bestätigt das Harness
  ok(await poll(async () => (await find('Leer A')).length + (await find('Leer B')).length + (await find('Leer B1')).length + (await find('Leer im vollen Ordner')).length === 0), 'Aufräumen: die drei leeren samt Unterordner aus den Lesezeichen entfernt')
  ok((await find('Leer C')).length === 1 && (await find('Spät')).length === 1, 'Inzwischen gefüllter Ordner Leer C samt Lesezeichen bleibt')
  ok(await until(page, () => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('1 nicht mehr leer ausgelassen'))), 'Meldung nennt den ausgelassenen Ordner')
  ok((await find('Nicht leer')).length === 1 && (await find('Ein Link')).length === 1, 'Nicht leerer Ordner und sein Link bleiben')
  const trash = await page.evaluate(async () => (await chrome.storage.local.get('pika')).pika.trash.map((e) => e.tree.title).sort())
  ok(trash.join('|') === 'Leer A|Leer B|Leer im vollen Ordner', 'Die drei liegen im Papierkorb: ' + trash.join('|'))
  ok(await poll(async () => (await col.locator('.colbody summary').count()) === 0 && /Keine leeren Ordner/.test(await col.innerText())), 'Spalte ist danach leer und sagt es')
  await page.locator('.toast button', { hasText: 'Rückgängig' }).click()
  ok(await poll(async () => JSON.stringify([await find('Leer A'), await find('Leer B'), await find('Leer C'), await find('Leer im vollen Ordner')]) === before && (await find('Leer B1')).length === 1), 'Rückgängig: alle wieder an der alten Stelle, auch der Unterordner')
  ok(await until(page, async () => (await chrome.storage.local.get('pika')).pika.trash.length === 0), 'Rückgängig leert den Papierkorb von diesen Einträgen')
  ok(await poll(async () => (await names()).length === 3), 'Spalte zeigt sie wieder (Leer C ist nicht mehr leer)')
}, { tour: true })
