// Gemeinsamer Unterbau der Chromium-Abläufe: frisches Profil, Erweiterung laden, Ollama-Ersatz, ok()/summary().
// Umgebung: PIKA_MOCK_PORT (Standard 11434; nur dieser Port ist im Manifest für Ollama freigegeben),
//           PIKA_CHROMIUM (Pfad zu einer Chromium-Datei, sonst der Playwright-Kanal "chromium").
import { chromium } from 'playwright'
import http from 'node:http'; import os from 'node:os'; import fs from 'node:fs'; import path from 'node:path'

export const PORT = Number(process.env.PIKA_MOCK_PORT) || 11434
export const MOCK = `http://localhost:${PORT}`

function mockServer(state) {
  return http.createServer((req, res) => {
    let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
      if (req.url === '/api/version') return res.end('{"version":"0.0.0"}')
      if (req.url === '/api/tags') return res.end(JSON.stringify({ models: [{ name: 'llama3:test', size: 2e9 }] }))
      if (req.url === '/api/pull') { state.pullBody = b; return res.end('{"status":"pulling abc","total":200,"completed":100}\n{"status":"success"}\n') }
      if (req.url === '/api/chat') { state.chatBody = b; return res.end(JSON.stringify({ message: { content: '{"topics":{"Erste":[0],"Zweite":[1]}}' } })) }
      res.setHeader('content-type', 'text/html'); if (req.url === '/csp') res.setHeader('content-security-policy', "default-src 'none'"); res.end(`<title>Seite ${req.url}</title>x`)
    })
  })
}

// Führt einen Ablauf aus: fn(env) mit env = { ctx, page, id, errs, ok, msg, relaunch, mock, EXT }.
// Fehler im Ablauf werden als FAIL gezählt; Exit-Code 1 bei jedem FAIL oder JS-Fehler.
export async function flow(name, fn, { mockServer: withMock = true } = {}) {
  const EXT = process.argv[2]
  if (!EXT) { console.error(`Aufruf: node ${process.argv[1]} <Erweiterungsordner>`); process.exit(2) }
  let pass = 0, fail = 0
  const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); c ? pass++ : fail++ }
  const mock = { chatBody: null, pullBody: null, url: MOCK }
  const srv = withMock ? mockServer(mock) : null
  if (srv) await new Promise((res, rej) => srv.once('error', rej).listen(PORT, res))
  const ud = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-'))
  const errs = []
  const env = { EXT, ok, errs, mock, ud, MOCK }
  const launch = async () => {
    const opts = { headless: true, ignoreDefaultArgs: ['--disable-extensions'], args: ['--disable-features=DisableLoadExtensionCommandLineSwitch', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] }
    if (process.env.PIKA_CHROMIUM) opts.executablePath = process.env.PIKA_CHROMIUM; else opts.channel = 'chromium'
    const ctx = await chromium.launchPersistentContext(ud, opts)
    let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent('serviceworker')
    env.ctx = ctx; env.id = sw.url().split('/')[2]
    env.msg = (p, m) => p.evaluate((m) => chrome.runtime.sendMessage(m), m)
    return ctx
  }
  // Neuer Tab mit Fehlersammler und automatisch bestätigten Dialogen (Namen nur für die Fehlerliste).
  env.open = async (url, label = '') => {
    const p = await env.ctx.newPage()
    p.on('pageerror', (e) => errs.push(label + e.message)); p.on('dialog', (d) => d.accept())
    if (url) await p.goto(url)
    return p
  }
  env.newtab = async () => { const p = await env.open(`chrome-extension://${env.id}/newtab.html`); await p.waitForSelector('#top button'); return p }
  // Wartet auf eine Bedingung im Seitenkontext und liefert true/false, statt zu werfen (der Ablauf läuft weiter, die Prüfung wird FAIL).
  env.until = (page, fn, arg, timeout = 8000) => page.waitForFunction(fn, arg, { timeout }).then(() => true, () => false)
  // Wartet im Node-Kontext auf eine Bedingung (z. B. Zahl der Tabs); true/false.
  env.poll = async (f, ms = 8000) => { for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 100))) if (await f()) return true; return !!(await f()) }
  // Erfundene Ordner aus test/fixtures (läuft auch in CI), danach neu laden, damit der Baum ruhig steht.
  env.seed = async (page) => {
    await page.evaluate(async (id) => {
      const { importFolders } = await import(`chrome-extension://${id}/lib/seed.js`)
      await importFolders(await (await fetch(`chrome-extension://${id}/test/fixtures/folders.json`)).json())
    }, env.id)
    await page.reload(); await page.waitForSelector('.item')
  }
  env.relaunch =async () => { await env.ctx.close(); await launch() }
  try {
    await launch()
    await fn(env)
  } catch (e) {
    console.log('FAIL Ablauf abgebrochen: ' + (e && e.stack || e)); fail++
  } finally {
    await env.ctx?.close().catch(() => {})
    srv?.close()
  }
  console.log('JS-Fehler:', errs.length ? errs : 'keine')
  console.log(`== ${name}: ${pass} OK, ${fail} FAIL, ${errs.length} JS-Fehler`)
  process.exitCode = fail || errs.length ? 1 : 0
}
