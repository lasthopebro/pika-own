// Ablauf „Widgets“: legt je ein Widget der fünf Typen über den Dialog an, prüft Titel, Anzeige und einen Klick,
// den Pomodoro-Wechsel im Hintergrund und das Entfernen. Node: node tools/e2e/widgets.mjs <Erweiterungsordner>
import { flow } from './harness.mjs'

flow('widgets', async ({ ctx, ok, newtab, until }) => {
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'])
  const page = await newtab()
  const W = (t) => page.locator('.widget', { hasText: t })
  // Dialog „Widget hinzufügen“ (Mehr-Menü), Typ wählen, Felder füllen
  const add = async (type, fill) => {
    await page.locator('#top button[aria-label="Mehr"]').click()
    await page.locator('.ctx button', { hasText: 'Widget hinzufügen' }).click()
    await page.locator('dialog select').selectOption(type)
    await page.locator('dialog button.primary').click()
    await page.waitForSelector('dialog h3:has-text("Widget: ' + type + '")')
    await fill?.(page.locator('dialog'))
    await page.locator('dialog button.primary').click()
    await page.waitForSelector('dialog', { state: 'detached' })
  }
  const stored = () => page.evaluate(async () => (await (await import('./lib/store.js')).load()).workspaces[0].widgets)

  await add('clock', (d) => d.locator('input').first().fill('Asia/Tokyo'))
  ok(await W('Asia/Tokyo').count() === 1, 'Uhr: Titel ist die Zeitzone')
  await page.waitForFunction(() => /\d\d:\d\d:\d\d/.test(document.querySelector('.widget .wbig')?.textContent || ''))
  ok(/^\d\d:\d\d:\d\d$/.test(await W('Asia/Tokyo').locator('.wbig').textContent()), 'Uhr: zeigt die Uhrzeit')
  await W('Asia/Tokyo').click({ button: 'right' })
  ok(await page.locator('.ctx button', { hasText: 'Widget entfernen' }).count() === 1, 'Uhr: Kontextmenü bietet „Widget entfernen“')
  await page.keyboard.press('Escape')

  await add('countdown', async (d) => { await d.locator('input').first().fill('Urlaub'); await d.locator('input[type=datetime-local]').fill('2030-01-01T10:00') })
  ok(await W('Urlaub').count() === 1, 'Countdown: Titel ist der Name')
  await page.waitForFunction(() => [...document.querySelectorAll('.widget')].some((w) => /^\d+d \d\d:\d\d:\d\d$/.test(w.querySelector('.wbig')?.textContent || '')))
  ok(/^\d+d \d\d:\d\d:\d\d$/.test(await W('Urlaub').locator('.wbig').textContent()), 'Countdown: zeigt Tage und Zeit')

  await add('timer')
  ok(await W('Timer 25 min').count() === 1, 'Timer: Titel mit Minuten')
  ok((await W('Timer 25 min').locator('.wbig').textContent()) === '25:00' && (await W('Timer 25 min').locator('.muted').textContent()).includes('angehalten'), 'Timer: 25:00, angehalten')
  await W('Timer 25 min').locator('button', { hasText: 'Start/Pause' }).click()
  await page.waitForFunction(() => ![...document.querySelectorAll('.widget')].find((w) => w.textContent.includes('Timer 25 min')).textContent.includes('angehalten'))
  ok(!!(await stored()).find((w) => w.type === 'timer').until, 'Timer: Start speichert den Ablaufzeitpunkt')
  await W('Timer 25 min').locator('button', { hasText: 'Reset' }).click()
  await page.waitForFunction(() => [...document.querySelectorAll('.widget')].find((w) => w.textContent.includes('Timer 25 min')).textContent.includes('angehalten'))
  ok(!(await stored()).find((w) => w.type === 'timer').until, 'Timer: Reset hält an')

  await add('counter', (d) => d.locator('input').first().fill('Kaffee'))
  ok(await W('Kaffee').count() === 1 && (await W('Kaffee').locator('.wbig').textContent()) === '0', 'Zähler: Titel und Startwert 0')
  const plus = W('Kaffee').locator('button', { hasText: '+' })
  await plus.click(); await plus.click(); await W('Kaffee').locator('button', { hasText: '−' }).click()
  await page.waitForFunction(async () => (await (await import('./lib/store.js')).load()).workspaces[0].widgets.find((w) => w.type === 'counter')?.n === 1)
  ok((await W('Kaffee').locator('.wbig').textContent()) === '1', 'Zähler: + + − ergibt 1')
  await page.reload(); await page.waitForSelector('.widget')
  ok((await W('Kaffee').locator('.wbig').textContent()) === '1', 'Zähler: Stand bleibt nach dem Neuladen')

  await add('snippets', (d) => d.locator('textarea').fill('Hallo\nGruß'))
  ok(await W('Textbausteine').count() === 1 && await W('Textbausteine').locator('button', { hasText: 'Hallo' }).count() === 1, 'Textbausteine: Titel und ein Knopf je Zeile')
  await W('Textbausteine').locator('button', { hasText: 'Gruß' }).click()
  ok(await page.locator('.toast', { hasText: 'Kopiert' }).count() === 1 && (await page.evaluate(() => navigator.clipboard.readText())) === 'Gruß', 'Textbausteine: Klick kopiert den Text')

  // Zwei Neue Tabs: Tab B ist alt (Zähler 1), Tab A erhöht auf 2, danach ändert B die Textbausteine; beide Änderungen bleiben (v0.7)
  const b = await newtab(); await b.waitForSelector('.widget')
  await plus.click()
  await page.waitForFunction(async () => (await (await import('./lib/store.js')).load()).workspaces[0].widgets.find((w) => w.type === 'counter')?.n === 2)
  await b.locator('.widget', { hasText: 'Textbausteine' }).locator('button[aria-label="Textbausteine bearbeiten"]').click()
  await b.locator('dialog textarea').fill('Hallo\nGruß\nNeu'); await b.locator('dialog button.primary').click()
  await b.waitForSelector('.widget button:has-text("Neu")')
  const both = await stored()
  ok(both.find((w) => w.type === 'counter').n === 2 && both.find((w) => w.type === 'snippets').items.join() === 'Hallo,Gruß,Neu', 'Zwei Neue Tabs: Zähler (Tab A) und Textbausteine (Tab B) sind beide gespeichert')
  await b.close()

  // Fehler-Isolation: beschädigte Daten und unbekannter Typ ergeben je eine Fehlerkarte, der Rest bleibt bedienbar
  await page.evaluate(async () => { const { update } = await import('./lib/store.js'); await update((S) => { S.workspaces[0].widgets.push({ id: 'kaputt', type: 'snippets', items: 5 }, { id: 'zukunft', type: 'gibtsnicht' }) }) })
  await page.reload(); await page.waitForSelector('.widget')
  ok(await page.locator('.widget-error').count() === 2 && await page.locator('.widget-error', { hasText: 'Widget-Fehler' }).first().locator('button', { hasText: 'Entfernen' }).count() === 1, 'Fehlerkarten: beschädigtes und unbekanntes Widget zeigen „Widget-Fehler“ mit Entfernen')
  ok(await W('Kaffee').count() === 1 && await page.locator('#top button').count() === 7, 'Fehlerkarten: andere Widgets und Board bleiben erhalten')
  await W('Kaffee').locator('button', { hasText: '+' }).click()
  ok(await until(page, async () => (await (await import('./lib/store.js')).load()).workspaces[0].widgets.find((w) => w.type === 'counter')?.n === 3), 'Fehlerkarten: Zähler daneben funktioniert weiter')
  while (await page.locator('.widget-error').count()) { const n = await page.locator('.widget-error').count(); await page.locator('.widget-error button', { hasText: 'Entfernen' }).first().click(); await page.waitForFunction((n) => document.querySelectorAll('.widget-error').length === n - 1, n) }
  ok(!(await stored()).some((w) => w.id === 'kaputt' || w.id === 'zukunft'), 'Fehlerkarte: Entfernen löscht das Widget aus dem Speicher')

  // Pomodoro: Der Hintergrund wechselt nach Ablauf in die Pause; der Neue Tab zeigt den Stand (aus e2e-chromium.mjs, v0.5.2)
  const pomo = await page.evaluate(async () => {
    const { update, load } = await import('./lib/store.js')
    const until = Date.now() + 800
    await update((S) => { S.workspaces[0].widgets.push({ id: 'pomo1', type: 'timer', minutes: 25, brk: 5, pomo: true, phase: 'work', until }) })
    chrome.alarms.create('timer|pomo1', { when: until })
    await new Promise((r) => setTimeout(r, 3000))
    const w = (await load()).workspaces[0].widgets.find((x) => x.id === 'pomo1')
    return { phase: w.phase, mins: Math.round((w.until - Date.now()) / 60e3) }
  })
  ok(pomo.phase === 'break' && pomo.mins === 5, 'Pomodoro: Hintergrund wechselt nach Ablauf in die Pause (5 min) ' + JSON.stringify(pomo))
  await page.reload(); await page.waitForSelector('.widget')
  ok(await W('Pomodoro 25/5').count() === 1, 'Neuer Tab zeigt den Pomodoro-Stand aus dem Hintergrund')

  // Entfernen
  const n0 = await page.locator('.widget').count()
  await W('Kaffee').click({ button: 'right' }); await page.locator('.ctx button', { hasText: 'Widget entfernen' }).click()
  await page.waitForFunction((n) => document.querySelectorAll('.widget').length === n - 1, n0)
  ok(await W('Kaffee').count() === 0 && !(await stored()).some((w) => w.label === 'Kaffee'), 'Entfernen: Widget weg und gespeichert')
})
