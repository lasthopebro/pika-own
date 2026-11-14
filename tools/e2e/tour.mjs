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
}, { tour: true })
