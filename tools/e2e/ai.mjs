// Ablauf „KI“: Weitermachen-Karten, Ollama-Status, Modellliste, Sortierung per Mock-Ollama, Download, Ordner anlegen.
// Aufruf: node tools/e2e/ai.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('ai', async ({ ok, open, newtab, seed, until, poll, mock, MOCK }) => {
  const page = await newtab(); await seed(page)
  for (const p of ['a', 'b', 'c']) await open(`${MOCK}/${p}`)
  await page.bringToFront(); await page.reload()
  ok(await until(page, () => document.querySelectorAll('#resume .card').length >= 1), 'Weitermachen-Karte aus dem Verlauf: ' + (await page.locator('#resume .card b').first().textContent().catch(() => '-')))
  await page.locator('button[title="KI"]').click()
  ok(await until(page, () => document.querySelectorAll('.dot.on').length === 1), 'Ollama-Status grün (/api/version)')
  ok(await until(page, () => document.querySelectorAll('.aimodels input[type=radio]').length === 1), 'Ollama-Modellliste mit Größe: ' + (await page.locator('.aimodels .lrow').first().innerText().catch(() => '-')).replace(/\n/g, ' '))
  await page.locator('.aimodels input[type=radio]').check()
  await page.locator('dialog button', { hasText: 'Offene Tabs nach Themen sortieren' }).click()
  ok(await until(page, () => document.querySelectorAll('.airesult h4').length === 3), 'KI-Themen angezeigt (2 vom Modell + Sonstiges für den dritten Tab): ' + (await page.locator('.airesult h4').allTextContents()).join(', '))
  const cb = JSON.parse(mock.chatBody || '{}')
  ok(cb.model === 'llama3:test' && cb.stream === false && cb.think === false && cb.format?.required?.[0] === 'topics', 'Chat-Request: Modell, think:false, JSON-Schema')
  await page.locator('.aimodels button', { hasText: 'Herunterladen' }).first().click()
  ok(await poll(() => mock.pullBody) && JSON.parse(mock.pullBody).model === 'qwen3:4b', 'Download-Request /api/pull für qwen3:4b')
  await page.locator('dialog button', { hasText: 'Als Lesezeichen-Ordner speichern' }).click()
  ok(await until(page, async () => (await chrome.bookmarks.search({ title: 'KI-Themen' })).length === 1), 'Ordner "KI-Themen" angelegt')
})
