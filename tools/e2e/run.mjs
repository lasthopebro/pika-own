// Startet alle Abläufe nacheinander, je als eigener Prozess mit frischem Profil. Ein fallender Ablauf stoppt die anderen nicht.
// Aufruf: node tools/e2e/run.mjs <Erweiterungsordner> [ablauf ...]   (ohne Namen laufen alle)
import { spawnSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const [ext, ...only] = process.argv.slice(2)
if (!ext) { console.error('Aufruf: node tools/e2e/run.mjs <Erweiterungsordner> [ablauf ...]'); process.exit(2) }
const ALL = ['board', 'bar', 'ai', 'capture', 'widgets']
const rows = []
for (const name of only.length ? only : ALL) {
  console.log(`\n### Ablauf ${name}`)
  const r = spawnSync(process.execPath, [path.join(dir, name + '.mjs'), ext], { encoding: 'utf8', maxBuffer: 1 << 26 })
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '')
  const m = /^== \S+: (\d+) OK, (\d+) FAIL, (\d+) JS-Fehler/m.exec(r.stdout || '')
  rows.push({ name, ok: m ? +m[1] : 0, fail: m ? +m[2] : 1, js: m ? +m[3] : 0, code: r.status ?? 1 })
}
console.log('\n=== Zusammenfassung')
for (const r of rows) console.log(`${r.code === 0 ? 'OK  ' : 'FAIL'} ${r.name.padEnd(8)} ${r.ok} OK, ${r.fail} FAIL, ${r.js} JS-Fehler (Exit ${r.code})`)
console.log(`Gesamt: ${rows.reduce((a, r) => a + r.ok, 0)} OK, ${rows.reduce((a, r) => a + r.fail, 0)} FAIL`)
process.exitCode = rows.some((r) => r.code !== 0) ? 1 : 0
