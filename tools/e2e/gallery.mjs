// Ablauf „Galerie“: V öffnet, Ordner hinein, Brotkrumen, Esc hoch und zurück, Suche je Ordner, Sprung per Palette,
// Raster/Liste und Dichte nach Neuladen, Eingabe überlebt Änderung aus anderem Tab, Ablegen auf Seitenleisten-Ordner mit Rückgängig.
// Aufruf: node tools/e2e/gallery.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('gallery', async ({ id, ok, newtab, seed, until, poll }) => {
  const page = await newtab()
  await seed(page)
  await page.evaluate(async (id) => {
    const { importFolders } = await import(`chrome-extension://${id}/lib/seed.js`)
    await importFolders([
      { path: ['Dev'], items: [{ t: 'GitHub', u: 'https://github.com/example' }, { t: 'GitLab', u: 'https://gitlab.com/example' }, { t: 'Docs', u: 'https://docs.example.org/' }, { t: 'Wiki', u: 'https://git-scm.com/doc' }] },
      { path: ['Dev', 'Tools'], items: [{ t: 'Hammer', u: 'https://example.org/hammer' }] },
    ])
  }, id)
  await page.reload(); await page.waitForSelector('.item')
  const cols = await page.locator('.col').count()
  const bm = (title) => page.evaluate((t) => chrome.bookmarks.search({ title: t }).then((r) => r.map((x) => ({ id: x.id, parentId: x.parentId }))), title)
  const crumbs = (p = page) => p.locator('#gal .gpath button').allTextContents()
  const tiles = (p = page) => p.locator('#gal .ggrid .item .t').allTextContents()
  const key = async (k) => { await page.locator('body').click({ position: { x: 5, y: 300 } }); await page.keyboard.press(k) }
  const inGallery = (p = page) => p.locator('#gal').count()
  const reopen = async () => { await key('v'); await page.waitForSelector('#gal') }
  const tile = (name) => page.locator('#gal .ggrid .item', { has: page.locator('.t', { hasText: new RegExp(`^${name}$`) }) })
  const dev = (await bm('Dev'))[0].id, tools = (await bm('Tools'))[0].id

  // V öffnet: Home mit allen Spalten als Ordner-Kacheln, Board dahinter nicht bedienbar
  ok((await inGallery()) === 0, 'Board zuerst, keine Galerie')
  await reopen()
  ok((await crumbs()).join('|') === 'Home' && (await page.locator('#gal .ggrid .gfolder').count()) === cols, `Home zeigt ${cols} Ordner-Kacheln wie das Board Spalten`)
  ok(await page.evaluate(() => document.querySelector('main').inert && document.getElementById('top').inert), 'Board dahinter ist inert')
  ok(await page.evaluate(() => document.activeElement?.closest('#gal') !== null), 'Fokus liegt in der Galerie')
  ok((await page.locator('#gal nav[aria-label="Pfad"]').count()) === 1 && (await page.locator('#gal input[aria-label="In diesem Ordner suchen"]').count()) === 1, 'Pfad (nav) und Suchfeld haben Namen')

  // Hinein: Ordner zuerst, dann Lesezeichen; Brotkrume
  await tile('Dev').click()
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev'), 'Klick auf Ordner geht hinein: Home › Dev')
  ok((await tiles()).join('|') === 'Tools|GitHub|GitLab|Docs|Wiki', 'Ordner zuerst, dann Lesezeichen in Baumreihenfolge: ' + (await tiles()).join('|'))

  // Suche je Ordner: Titel und Adresse, Groß/Klein egal, leeres Feld zeigt alles
  const q = page.locator('#gal .gq')
  await q.fill('GIT')
  ok(await poll(async () => (await tiles()).join('|') === 'GitHub|GitLab|Wiki'), 'Filter „GIT“: Titel und Adresse, Groß/Klein egal: ' + (await tiles()).join('|'))
  await q.fill('zzzz')
  ok(await poll(async () => (await page.locator('#gal .ggrid .item').count()) === 0 && /Keine Treffer/.test(await page.locator('#gal .ggrid').innerText())), 'Kein Treffer: Hinweis statt Kacheln')
  await q.fill('')
  ok(await poll(async () => (await tiles()).length === 5), 'Leeres Feld zeigt alle')

  // Esc im Suchfeld leert zuerst, dann geht es hoch
  await q.fill('git'); await q.press('Escape')
  ok(await poll(async () => (await q.inputValue()) === '' && (await tiles()).length === 5 && (await crumbs()).join('|') === 'Home|Dev'), 'Esc leert zuerst das Suchfeld, Ebene bleibt')

  // Pfeiltasten und Enter im Suchfeld: Enter öffnet den ersten Treffer (hier den Ordner), ArrowDown springt auf die erste Kachel
  await q.fill('tool'); await q.press('Enter')
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev|Tools'), 'Enter im Suchfeld öffnet den ersten Treffer: Home › Dev › Tools')
  ok((await tiles()).join('|') === 'Hammer' && (await q.inputValue()) === '', 'Neue Ebene: Suchfeld leer, Inhalt des Ordners')

  // Esc: eine Ebene hoch, Fokus auf der verlassenen Kachel; auf Home zurück zum Board
  await page.locator('#gal .ggrid .item').first().focus(); await page.keyboard.press('Escape')
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev'), 'Esc geht eine Ebene hoch')
  ok(await until(page, (t) => document.activeElement?.dataset.id === t, tools), 'Fokus kehrt auf die zuletzt geöffnete Kachel (Tools) zurück')
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
  ok(await poll(async () => (await inGallery()) === 0), 'Esc auf Home schließt die Galerie')
  ok(await page.evaluate(() => !document.querySelector('main').inert) && (await page.locator('.col').count()) === cols, 'Board wieder da und bedienbar')
  ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.startsWith('Board / Galerie') === true), 'Fokus kehrt auf den Kopf-Knopf zurück')

  // Kopf-Knopf öffnet ebenfalls; Brotkrume Home; V schließt
  await page.locator('#top button[aria-label^="Board / Galerie"]').click(); await page.waitForSelector('#gal')
  await tile('Dev').click(); await page.waitForSelector('#gal .gpath button >> nth=1')
  await tile('Tools').click(); await poll(async () => (await crumbs()).length === 3)
  await page.locator('#gal .gpath button', { hasText: 'Dev' }).click()
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev'), 'Brotkrume Dev geht zurück')
  await page.locator('#gal .gpath button', { hasText: 'Home' }).click()
  ok(await poll(async () => (await crumbs()).join('|') === 'Home'), 'Brotkrume Home geht auf Home')
  ok((await page.locator('#gal .gpath button[aria-current=page]').textContent()) === 'Home', 'Aktuelle Stufe trägt aria-current')
  await page.keyboard.press('v')
  ok(await poll(async () => (await inGallery()) === 0), 'V schließt die Galerie')

  // Palette: / springt in den Ordner (Pfad stimmt)
  await reopen(); await page.keyboard.press('f'); await page.waitForSelector('dialog.pal input')
  await page.locator('dialog.pal input').fill('/Tools'); await page.keyboard.press('Enter')
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev|Tools'), 'Palette „/Tools“ setzt den Pfad: Home › Dev › Tools')
  await page.waitForSelector('dialog', { state: 'detached' })

  // Raster/Liste und Dichte merken
  await page.locator('#gal .gctl button[aria-label="Liste"]').click(); await page.locator('#gal .gctl button[aria-label="Dichte klein"]').click()
  ok(await until(page, () => document.getElementById('gal').dataset.mode === 'list' && document.getElementById('gal').dataset.d === 's'), 'Liste und klein angewendet')
  ok(await poll(async () => (await page.evaluate(async () => { const s = (await chrome.storage.local.get('pika')).pika?.settings; return s?.galleryMode + '|' + s?.galleryDensity })) === 'list|s'), 'Wahl ist gespeichert')
  await page.reload(); await page.waitForSelector('#top button'); await reopen()
  ok(await until(page, () => document.getElementById('gal').dataset.mode === 'list' && document.getElementById('gal').dataset.d === 's'), 'Nach Neuladen: wieder kleine Liste')
  ok((await page.locator('#gal .gctl button[aria-pressed=true]').allTextContents()).join('|') === 'Liste|S', 'Gewählte Knöpfe sind aria-pressed')
  await page.locator('#gal .gctl button[aria-label="Raster"]').click(); await page.locator('#gal .gctl button[aria-label="Dichte mittel"]').click()
  ok(await poll(async () => (await page.evaluate(async () => { const s = (await chrome.storage.local.get('pika')).pika?.settings; return s?.galleryMode + '|' + s?.galleryDensity })) === 'grid|m'), 'Zurück auf Raster/mittel gespeichert')

  // Zweiter Neuer Tab ändert eine Einstellung: Eingabe im ersten Tab bleibt
  await tile('Dev').click(); await poll(async () => (await crumbs()).length === 2)
  await q.fill('git'); await q.focus()
  const b = await newtab()
  await b.evaluate(async (id) => { const { update } = await import(`chrome-extension://${id}/lib/store.js`); await update((S) => { S.settings.galleryDensity = 'l'; S.tags.fremd = '#ef4444' }) }, id)
  ok(await until(page, () => document.getElementById('gal').dataset.d === 'l'), 'Änderung aus anderem Tab kommt an (Dichte groß)')
  ok((await q.inputValue()) === 'git' && (await tiles()).join('|') === 'GitHub|GitLab|Wiki' && (await page.evaluate(() => document.activeElement?.classList.contains('gq'))), 'Suchtext, Treffer und Fokus bleiben trotz Fremdänderung')
  await b.close()
  await q.fill('')
  await page.locator('#gal .gctl button[aria-label="Dichte mittel"]').click()

  // Ablegen: Kachel auf Ordner in der Seitenleiste ziehen, Rückgängig
  const gh = (await bm('GitHub'))[0], lernen = (await bm('Lernen'))[0].id
  ok(gh.parentId === dev, 'Vorher: GitHub liegt in Dev')
  await tile('GitHub').dragTo(page.locator('#gal .gs', { hasText: /^Lernen$/ }))
  ok(await poll(async () => (await bm('GitHub'))[0]?.parentId === lernen), 'Ziehen auf „Lernen“ in der Seitenleiste verschiebt das Lesezeichen')
  await page.waitForSelector('.toast button:has-text("Rückgängig")')
  await page.locator('.toast button', { hasText: 'Rückgängig' }).click()
  ok(await poll(async () => (await bm('GitHub'))[0]?.parentId === dev), 'Rückgängig stellt GitHub in Dev zurück')

  // Gelöschter Ordner im Pfad: Galerie bricht nicht, Pfad wird gekürzt
  await tile('Tools').click(); await poll(async () => (await crumbs()).length === 3)
  await page.evaluate((t) => chrome.bookmarks.removeTree(t), tools)
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Dev'), 'Ordner gelöscht: Pfad wird auf Home › Dev gekürzt')

  // Einstellungen (Abschnitt Board) setzen dieselben Werte
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
  await poll(async () => (await inGallery()) === 0)
  await page.locator('#top button[aria-label="Einstellungen"]').click()
  const dlg = page.locator('dialog', { has: page.locator('h3', { hasText: 'Einstellungen' }) })
  await dlg.getByLabel('Galerie (Taste V): Darstellung').selectOption('list'); await dlg.getByLabel('Galerie (Taste V): Dichte').selectOption('l')
  await dlg.locator('button.primary').click()
  ok(await poll(async () => (await page.evaluate(async () => { const s = (await chrome.storage.local.get('pika')).pika?.settings; return s?.galleryMode + '|' + s?.galleryDensity })) === 'list|l'), 'Einstellungen: Liste und groß gespeichert')
  await page.waitForSelector('dialog', { state: 'detached' })
  await reopen()
  ok(await until(page, () => document.getElementById('gal').dataset.mode === 'list' && document.getElementById('gal').dataset.d === 'l'), 'Galerie übernimmt die Werte aus den Einstellungen')

  // Review-Fixes. Fokus auf Seitenleisten-/Pfadknopf bleibt bei Fremdänderung, auch wenn die Leiste neu gezeichnet wird
  const barId = (await bm('Lernen'))[0] && (await page.evaluate((i) => chrome.bookmarks.get(i).then((r) => r[0].parentId), lernen))
  const other = await newtab()
  const fremd = (t) => other.evaluate(([p, t]) => chrome.bookmarks.create({ parentId: p, title: t, url: 'https://example.com/' + t }), [dev, t])
  const devCount = async () => (await page.locator('#gal .gfolder', { hasText: /^Dev/ }).first().getAttribute('aria-label')) || ''
  await page.locator('#gal .gs', { hasText: /^Lernen$/ }).focus()
  await fremd('Fremd1')
  ok(await poll(async () => /, 5 Lesezeichen/.test(await devCount())), 'Fremdänderung kam an (Dev: 5 Lesezeichen)')
  ok(await page.evaluate((l) => document.activeElement?.dataset.id === l && document.activeElement.classList.contains('gs'), lernen), 'Fokus bleibt auf dem Seitenleistenknopf trotz Fremdänderung')
  await page.locator('#gal .gpath button').first().focus()
  await fremd('Fremd2')
  ok(await poll(async () => /, 6 Lesezeichen/.test(await devCount())), 'Zweite Fremdänderung kam an (Dev: 6 Lesezeichen)')
  ok(await page.evaluate(() => document.activeElement?.dataset.i === '-1' && document.activeElement.closest('.gpath') !== null), 'Fokus bleibt auf dem Pfadknopf trotz Fremdänderung')
  // Leerer Zielordner: Fokus fällt auf das Suchfeld, nicht auf body
  await page.evaluate((p) => chrome.bookmarks.create({ parentId: p, title: 'Leer' }), barId)
  await page.locator('#gal .gs', { hasText: /^Leer$/ }).waitFor()
  await page.locator('#gal .gs', { hasText: /^Leer$/ }).click()
  ok(await poll(async () => (await crumbs()).join('|') === 'Home|Leer') && await page.evaluate(() => document.activeElement?.classList.contains('gq')), 'Leerer Ordner über Seitenleiste: Fokus auf dem Suchfeld')
  // Seitenleiste wird beim Tippen im Suchfeld nicht neu gezeichnet
  await page.evaluate(() => { window.__gs = document.querySelector('#gal .gs'); window.__gp = document.querySelector('#gal .gpath button') })
  await page.locator('#gal .gq').fill('abc')
  ok(await page.evaluate(() => window.__gs.isConnected && window.__gp.isConnected), 'Suchtext zeichnet Seitenleiste und Pfad nicht neu')
  await page.locator('#gal .gq').fill('')
  // S und N wirken nicht hinter der Galerie
  await page.evaluate(() => document.activeElement.blur())
  await page.keyboard.press('s'); await page.keyboard.press('n')
  await page.waitForTimeout(300)
  ok(await page.evaluate(() => document.getElementById('selbar').hidden && !document.querySelector('dialog[open]')), 'S und N tun bei offener Galerie nichts (kein Auswahlmodus, kein Dialog)')
  // Ziehen auf den eigenen Elternordner sortiert nicht um
  await page.locator('#gal .gpath button', { hasText: 'Home' }).click()
  await tile('Dev').click(); await poll(async () => (await crumbs()).join('|') === 'Home|Dev')
  const idx = () => page.evaluate((t) => chrome.bookmarks.search({ title: t }).then((r) => r[0].index), 'GitHub')
  const i0 = await idx()
  await tile('GitHub').dragTo(page.locator('#gal .gs', { hasText: /^Dev$/ }))
  await page.waitForTimeout(400)
  ok((await idx()) === i0 && (await page.locator('.toast', { hasText: 'Verschoben' }).count()) === 0, 'Ziehen auf den eigenen Elternordner ändert nichts und meldet nichts')
  // Virtuelle Kachel (Meistbesucht) nimmt Drops an (preventDefault), legt aber nichts ab
  await page.evaluate(async (id) => { const { update } = await import(`chrome-extension://${id}/lib/store.js`); await update((S) => { S.settings.discover = true }) }, id)
  await page.locator('#gal .gpath button', { hasText: 'Home' }).click()
  await tile('Meistbesucht').waitFor()
  const prevented = await page.evaluate(() => {
    const t = [...document.querySelectorAll('#gal .gfolder')].find((x) => x.querySelector('.t').textContent === 'Meistbesucht')
    const f = (type) => { const e = new DragEvent(type, { bubbles: true, cancelable: true }); t.dispatchEvent(e); return e.defaultPrevented }
    return [f('dragover'), f('drop')]
  })
  ok(prevented.join() === 'true,true', 'Virtuelle Kachel verhindert den Browser-Standard bei dragover und drop')
  await other.close()
})
