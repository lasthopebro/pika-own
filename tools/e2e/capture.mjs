// Ablauf „Einfangen“: Einfügen mit Rückgängig, Tabs als Ordner, Live-Ordner als Tab-Gruppe, Sicherungs-Hinweis.
// Aufruf: node tools/e2e/capture.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('capture', async ({ ok, msg, open, newtab, seed, until, poll, MOCK }) => {
  const page = await newtab(); await seed(page)
  for (const p of ['a', 'b']) await open(`${MOCK}/${p}`)
  await page.bringToFront()
  await msg(page, { type: 'lf', op: 'add', args: ['Projekt'] })
  const pf = (await msg(page, { type: 'getBar', host: '' })).folders.find((f) => f.name === 'Projekt')
  await msg(page, { type: 'lf', op: 'assign', args: [pf.id, `${MOCK}/a`, 'Seite a'] })

  // Strg+V legt Links ab (nur http/https), Rückgängig entfernt sie wieder
  const pasted = 'https://example.org/eingefuegt'
  await page.evaluate((u) => { const dt = new DataTransfer(); dt.setData('text/plain', 'Bitte merken: ' + u + ' und javascript:alert(1)'); document.body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })) }, pasted)
  const bmCount = () => page.evaluate((u) => chrome.bookmarks.search({ url: u }).then((r) => r.length), pasted)
  ok(await poll(async () => (await bmCount()) === 1) && (await page.locator('.toast', { hasText: 'gespeichert in' }).count()) === 1, 'Strg+V legt Link ab (javascript: nicht), Meldung nennt den Ordner')
  await page.locator('.toast button', { hasText: 'Rückgängig' }).click()
  ok(await poll(async () => (await bmCount()) === 0), 'Rückgängig entfernt das eingefügte Lesezeichen')

  // Alle Tabs als Ordner, Live-Ordner als Tab-Gruppe
  const tf = await msg(page, { type: 'saveTabsFolder' })
  ok(tf.n >= 1 && (await page.evaluate((id) => chrome.bookmarks.getChildren(id).then((c) => c.length), tf.id)) === tf.n, `Alle Tabs als Ordner: ${tf.n} Lesezeichen in „${tf.title}“`)
  ok((await msg(page, { type: 'folderGroup', id: pf.id })) === true && (await page.evaluate((m) => chrome.tabs.query({ url: m + '/*' }).then((t) => t.some((x) => x.groupId > -1)), MOCK)), 'Live-Ordner als Tab-Gruppe geöffnet')

  // Hinweis auf eine Sicherungsdatei außerhalb des Profils
  await page.reload(); await page.waitForSelector('#top button')
  ok(await until(page, () => document.querySelectorAll('#nag .nag').length === 1), 'Hinweis auf Sicherungsdatei außerhalb des Profils (noch nie exportiert)')
  await page.locator('#nag button', { hasText: 'Später' }).click()
  ok(await until(page, () => document.querySelectorAll('#nag .nag').length === 0), 'Hinweis lässt sich für 14 Tage schließen')
})
