// Ablauf „Berechtigungen“: Einstellungen → Datenschutz listet jede Berechtigung des Manifests mit Klartext und Status;
// Pflicht-Berechtigungen haben keinen Knopf; Widerruf (mit nachgestellter permissions-API, denn die Zusage per Dialog ist headless nicht möglich)
// schaltet die Leiste auf Webseiten aus; Fehler beim Widerruf werden gemeldet. Echtes Erteilen/Widerrufen bleibt Handprüfung.
// Aufruf: node tools/e2e/perms.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('perms', async ({ id, ok, newtab, until, poll }) => {
  const page = await newtab()
  const open = async () => {
    await page.locator('#top button[aria-label="Einstellungen"]').click()
    const set = page.locator('dialog', { has: page.locator('h3', { hasText: 'Einstellungen' }) })
    await set.locator('details.permbox summary').click()
    return set
  }
  const names = await page.evaluate(() => { const m = chrome.runtime.getManifest(); return [...new Set(['permissions', 'optional_permissions', 'host_permissions', 'optional_host_permissions'].flatMap((k) => m[k] || []))] })
  const set = await open()
  const rows = set.locator('.permbox .prow')
  ok(await poll(async () => (await rows.count()) === names.length), `Eine Zeile je Berechtigung des Manifests (${names.length})`)
  const info = await rows.evaluateAll((r) => r.map((x) => ({ name: x.dataset.perm, granted: x.dataset.granted, text: x.querySelector('span').textContent, stat: x.querySelector('.pstat').textContent, btn: x.querySelectorAll('button').length })))
  ok(info.every((r) => r.text.length > r.name.length + 15), 'Jede Zeile hat einen Klartext hinter dem Namen')
  ok(JSON.stringify(info.map((r) => r.name)) === JSON.stringify(names), 'Reihenfolge und Namen stammen aus dem Manifest')
  const all = info.find((r) => r.name === '<all_urls>')
  ok(all && all.granted === 'false' && /optional, nicht erteilt/.test(all.stat) && all.btn === 0, 'Optionale Webseiten-Berechtigung: nicht erteilt, kein Widerrufen-Knopf')
  ok(info.filter((r) => r.name !== '<all_urls>').every((r) => /^nötig, /.test(r.stat) && r.btn === 0), 'Pflicht-Berechtigungen: „nötig“, nie ein Widerrufen-Knopf')
  // getAll() nennt auch implizite Rechte ohne Manifest-Eintrag (newTabPageOverride); die gehören nicht in die Liste.
  const granted = await page.evaluate(() => chrome.permissions.getAll().then((g) => [...g.permissions, ...g.origins]))
  ok(granted.filter((p) => names.includes(p)).length === names.length - 1 && granted.filter((p) => names.includes(p)).every((p) => info.find((r) => r.name === p).granted === 'true'), 'Alles aus permissions.getAll(), was im Manifest steht, ist als erteilt gezeigt (alle außer <all_urls>)')
  ok(info.filter((r) => r.granted === 'true').every((r) => granted.includes(r.name)), 'Und umgekehrt: jede als erteilt gezeigte steht in getAll()')
  await set.locator('button', { hasText: 'Abbrechen' }).click()

  // Widerruf mit nachgestellter API: Zeile, Meldung, Fehlerweg (Modul direkt, echtes DOM)
  const r = await page.evaluate(async (id) => {
    const { permsNode } = await import(`chrome-extension://${id}/lib/perms-ui.js`)
    const state = { '<all_urls>': true }, calls = [], revoked = []
    let boom = true
    const perms = {
      contains: async (q) => (q.origins ? state[q.origins[0]] ?? false : true),
      remove: async (q) => { calls.push(q); if (boom) throw new Error('boom'); state[q.origins[0]] = false; return true },
    }
    const node = permsNode({ manifest: { permissions: ['storage'], optional_host_permissions: ['<all_urls>'] }, perms, onRevoke: async (e) => { revoked.push(e.name) } })
    node.open = true; document.body.append(node)
    const row = () => node.querySelector('[data-perm="<all_urls>"]'), wait = async (f) => { for (let i = 0; i < 80 && !f(); i++) await new Promise((r) => setTimeout(r, 25)) }
    await wait(() => row()?.querySelector('button'))
    const out = { storageBtn: node.querySelector('[data-perm=storage] button') !== null, before: row().dataset.granted }
    row().querySelector('button').click()
    await wait(() => node.querySelector('[role=status]').textContent.includes('boom'))
    out.err = node.querySelector('[role=status]').textContent; out.stillGranted = row().dataset.granted === 'true' && !!row().querySelector('button:not([disabled])'); out.revokedAfterErr = revoked.length
    boom = false
    row().querySelector('button').click()
    await wait(() => row().dataset.granted === 'false')
    out.after = row().dataset.granted; out.calls = JSON.stringify(calls); out.revoked = revoked.join(); out.noBtn = row().querySelector('button') === null; out.stat = row().querySelector('.pstat').textContent
    node.remove()
    return out
  }, id)
  ok(!r.storageBtn && r.before === 'true', 'Pflicht ohne Knopf, optionale erteilte mit Knopf')
  ok(/nicht widerrufen: boom/.test(r.err) && r.stillGranted && r.revokedAfterErr === 0, 'Fehler beim Widerruf: Meldung mit Grund, Zeile bleibt erteilt, Knopf wieder bedienbar')
  ok(r.after === 'false' && r.noBtn && r.revoked === '<all_urls>' && /nicht erteilt/.test(r.stat) && r.calls === JSON.stringify([{ origins: ['<all_urls>'] }, { origins: ['<all_urls>'] }]), 'Widerruf: permissions.remove mit dem Muster, Zeile „nicht erteilt“, Aufrufer benachrichtigt')

  // Einbindung in die Einstellungen: Widerruf der Webseiten-Berechtigung schaltet die Leiste aus und ändert den Knopf
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.on = true }) })
  await page.reload(); await page.waitForSelector('#top button')
  await page.evaluate(() => { let on = true; chrome.permissions.contains = async (q) => (q.origins?.[0] === '<all_urls>' ? on : true); chrome.permissions.remove = async () => { on = false; return true } })
  const s2 = await open()
  ok(await s2.locator('button', { hasText: 'Leiste auf Webseiten ausschalten' }).count() === 1, 'Vorher: Knopf bietet „ausschalten“')
  await s2.locator('button[aria-label="Berechtigung <all_urls> widerrufen"]').click()
  ok(await until(page, async () => (await chrome.storage.local.get('pika')).pika.settings.pagebar.on === false), 'Nach Widerruf ist die Leiste auf Webseiten ausgeschaltet (gespeichert)')
  ok(await poll(async () => (await s2.locator('button', { hasText: 'Leiste auf Webseiten einschalten' }).count()) === 1), 'Der Knopf bietet jetzt „einschalten“ an')
  ok(await poll(async () => (await s2.locator('[data-perm="<all_urls>"] button').count()) === 0), 'Die Zeile zeigt nicht erteilt, ohne Knopf')
  await s2.locator('button', { hasText: 'Abbrechen' }).click()

  // Einzelne Seite noch erteilt: der Widerruf von <all_urls> lässt die Leiste an
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.settings.pagebar.on = true }) })
  await page.reload(); await page.waitForSelector('#top button')
  await page.evaluate(() => {
    let on = true; const getAll = chrome.permissions.getAll.bind(chrome.permissions)
    chrome.permissions.contains = async (q) => (q.origins?.[0] === '<all_urls>' ? on : true)
    chrome.permissions.remove = async () => { on = false; return true }
    chrome.permissions.getAll = async () => { const g = await getAll(); return { ...g, origins: [...g.origins, 'https://example.org/*'] } }
  })
  const s3 = await open()
  await s3.locator('button[aria-label="Berechtigung <all_urls> widerrufen"]').click()
  ok(await poll(async () => (await s3.locator('[data-perm="<all_urls>"] button').count()) === 0 && (await s3.locator('[data-perm="<all_urls>"]').getAttribute('data-granted')) === 'false'), 'Widerruf durchgeführt (Zeile „nicht erteilt“)')
  ok(await page.evaluate(() => chrome.storage.local.get('pika').then((r) => r.pika.settings.pagebar.on)) === true && await s3.locator('button', { hasText: 'Leiste auf Webseiten ausschalten' }).count() === 1, 'Einzelne Seite noch erteilt: Leiste bleibt an, Knopf bietet weiter „ausschalten“')
  await s3.locator('button', { hasText: 'Abbrechen' }).click()
})
