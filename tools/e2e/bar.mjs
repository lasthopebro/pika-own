// Ablauf „Leiste“: Live-Ordner, Leiste im Neuen Tab, Ziehen, Symbol-Auswahl, Seitenleiste, Leiste auf Webseiten, Neustart.
// Aufruf: node tools/e2e/bar.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('bar', async (env) => {
  const { ctx, id, ok, msg, open, newtab, seed, until, poll, MOCK } = env
  const page = await newtab(); await seed(page)
  for (const p of ['a', 'b', 'c']) await open(`${MOCK}/${p}`)
  await page.bringToFront()

  // Seitenleiste: eigene Ansicht anlegen
  const sb = await open(`chrome-extension://${id}/sidebar.html`, 'sb ')
  await sb.waitForSelector('button[title="Neue Ansicht"]')
  await sb.locator('button[title="Neue Ansicht"]').click(); await sb.locator('dialog input').first().fill('Mein Ordner'); await sb.locator('dialog button.primary').click()
  await sb.waitForSelector('dialog select')
  await sb.locator('dialog select').selectOption({ index: 3 }); await sb.locator('dialog button.primary').click()
  ok(await until(sb, () => document.querySelectorAll('#sidehead option').length === 7), 'eigene Ansicht angelegt (7 Ansichten inkl. Live-Ordner)')
  ok(await until(sb, () => document.querySelectorAll('#body .item, #body p').length >= 1), 'Ansicht rendert Inhalt')
  await sb.locator('#sidehead select').selectOption({ label: 'Tabs' })
  ok(await until(sb, () => document.querySelectorAll('#body .item').length >= 3), 'Tabs-Ansicht listet offene Tabs')

  // Leiste und Live-Ordner (v0.4)
  await msg(page, { type: 'lf', op: 'add', args: ['Projekt'] })
  let bar = await msg(page, { type: 'getBar', host: '' })
  const pf = bar.folders.find((f) => f.name === 'Projekt')
  await msg(page, { type: 'lf', op: 'assign', args: [pf.id, `${MOCK}/a`, 'Seite a'] })
  await msg(page, { type: 'lf', op: 'assign', args: [pf.id, `${MOCK}/zu`, 'Seite zu'] })
  await page.reload(); await page.waitForSelector('#pikabar .pb button')
  ok((await page.locator('#pikabar .pb button', { hasText: 'Projekt' }).count()) === 1, 'Leiste zeigt Live-Ordner "Projekt" mit Symbol')
  bar = await msg(page, { type: 'getBar', host: '' })
  ok(bar.folders.find((f) => f.name === 'Projekt').items.map((i) => i.live).join() === 'true,false', 'Live-Markierung: offener Tab erkannt, geschlossener nicht')
  const tabsBefore = ctx.pages().length
  await msg(page, { type: 'focusOrOpen', url: `${MOCK}/a` })
  await new Promise((r) => setTimeout(r, 500)) // Abwesenheit abwarten: es darf kein neuer Tab entstehen
  ok(ctx.pages().length === tabsBefore, 'Öffnen ohne Duplikat (vorhandener Tab wird fokussiert)')
  const tq = Date.now(); await msg(page, { type: 'getBar', host: '' }); ok(Date.now() - tq < 200, `getBar unter 200 ms (${Date.now() - tq} ms)`)

  // Ziehen auf Live-Ordner
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#pikabar .pb button')].find((x) => x.textContent.includes('Projekt'))
    const dt = new DataTransfer(); dt.setData('text/uri-list', '# k\nhttps://example.org/gezogen'); dt.setData('text/plain', 'Gezogen')
    b.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true })); b.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }))
  })
  ok(await until(page, async () => (await chrome.runtime.sendMessage({ type: 'getBar', host: '' })).folders.find((f) => f.name === 'Projekt').items.some((i) => i.u === 'https://example.org/gezogen' && i.t === 'Gezogen')), 'Link auf Live-Ordner gezogen = zugeordnet (mit Titel)')

  // Seitenleiste: Ansicht Live-Ordner zeigt die Leiste senkrecht
  await sb.locator('#sidehead select').selectOption({ label: 'Live-Ordner' })
  ok(await until(sb, () => [...document.querySelectorAll('#body .pb.v button')].some((b) => b.textContent.includes('Projekt'))), 'Seitenleiste: Ansicht Live-Ordner zeigt die Leiste senkrecht')

  // Symbol-Raster in der Leiste
  await page.locator('#pikabar .pb button', { hasText: 'Projekt' }).click(); await page.locator('.pb-menu button', { hasText: 'Symbol …' }).click()
  ok((await page.locator('.pb-menu .pb-grid button').count()) >= 24 && (await page.evaluate(() => document.activeElement?.closest('.pb-grid') != null)), 'Symbol-Auswahl: Raster mit mindestens 24 Emoji, Fokus im Raster')
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter')
  ok(await until(page, () => [...document.querySelectorAll('#pikabar .pb button')].find((b) => b.textContent.includes('Projekt'))?.innerText.includes('📂')), 'Emoji per Tastatur gewählt, Leiste zeigt es sofort')

  // Leiste auf Webseiten (v0.5): einschalten, strenge CSP, Ausschlussliste, Zustand klein
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.on = true }) })
  await msg(page, { type: 'pagebar' })
  const cp = await open(`${MOCK}/csp`)
  ok(await until(cp, () => getComputedStyle(document.documentElement).marginTop === '30px'), 'Leiste auf Seite mit strenger CSP sichtbar (Seite 30 px nach unten)')
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.exclude = 'localhost' }) })
  await cp.reload(); await cp.waitForLoadState('load')
  await new Promise((r) => setTimeout(r, 1500)) // Abwesenheit abwarten: die Leiste darf nicht mehr erscheinen
  ok((await cp.evaluate(() => getComputedStyle(document.documentElement).marginTop)) === '0px', 'Ausschlussliste: Leiste fehlt auf localhost')
  const slim = await msg(page, { type: 'getBar', host: '' })
  ok(!('settings' in slim) && !('meta' in slim) && JSON.stringify(slim).length < 20000, 'getBar liefert nur den schlanken Ausschnitt (' + JSON.stringify(slim).length + ' Zeichen)')

  // Neustart des Browsers
  await env.relaunch()
  const p2 = await env.newtab()
  const bar2 = await env.msg(p2, { type: 'getBar', host: '' })
  ok(bar2.folders.some((f) => f.name === 'Projekt' && f.items.length === 3), 'Live-Ordner nach Neustart des Browsers noch da (3 Einträge inkl. gezogenem)')
})
