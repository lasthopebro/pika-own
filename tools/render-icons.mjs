// Erzeugt icons/icon-16|32|48|128.png aus icons/icon.svg (einmalig; die PNGs werden eingecheckt).
// Aufruf: node tools/render-icons.mjs [Chromium-Programmdatei]  (Standard: Playwright-Chromium)
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'icons')
const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8')
const browser = await chromium.launch(process.argv[2] ? { executablePath: process.argv[2] } : { channel: 'chromium' })
for (const n of [16, 32, 48, 128]) {
  const page = await browser.newPage({ viewport: { width: n, height: n } })
  await page.setContent(`<body style="margin:0;background:transparent"><img width="${n}" height="${n}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body>`)
  fs.writeFileSync(path.join(dir, `icon-${n}.png`), await page.screenshot({ omitBackground: true, type: 'png' }))
  await page.close()
}
await browser.close()
